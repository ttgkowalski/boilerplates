import type { Request, Response, NextFunction } from "express";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import { SEMATTRS_HTTP_METHOD, SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_STATUS_CODE, SEMATTRS_HTTP_URL } from "@opentelemetry/semantic-conventions";

const tracer = trace.getTracer("express-tracer");

export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = req.method;
  const url = req.url;
  const path = req.path || url.split("?")[0]; // Remove query string
  const fullUrl = `${req.protocol}://${req.get("host")}${url}`;

  // Tentar obter a rota do Express (pode não estar disponível ainda)
  const route = (req as any).route?.path || path;
  
  // Criar nome do span com método HTTP e path
  const spanName = `${method} ${route}`;
  
  const span = tracer.startSpan(spanName, {
    kind: 1, // SpanKind.SERVER
    attributes: {
      [SEMATTRS_HTTP_METHOD]: method,
      [SEMATTRS_HTTP_ROUTE]: route,
      [SEMATTRS_HTTP_TARGET]: url,
      [SEMATTRS_HTTP_URL]: fullUrl,
      "http.request.path": path,
      "http.request.route": route,
      "http.request.original_url": url,
    },
  });

  // Adicionar informações do usuário autenticado se disponível
  if (req.auth) {
    span.setAttribute("user.id", req.auth.user_id);
    span.setAttribute("user.tenant_id", req.auth.tenant_id || "");
    span.setAttribute("user.roles", req.auth.roles.join(","));
  }

  const activeContext = trace.setSpan(context.active(), span);

  // Executar no contexto do span
  context.with(activeContext, () => {
    // Interceptar o fim da resposta
    res.on("finish", () => {
      const statusCode = res.statusCode;
      span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, statusCode);

      // Atualizar rota final se disponível (Express pode ter processado a rota)
      const finalRoute = (req as any).route?.path || req.path || route;
      if (finalRoute !== route) {
        span.setAttribute(SEMATTRS_HTTP_ROUTE, finalRoute);
        span.setAttribute("http.request.route", finalRoute);
      }

      if (statusCode >= 400) {
        span.setStatus({
          code: statusCode >= 500 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
          message: `HTTP ${statusCode}`,
        });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      span.end();
    });

    // Capturar erros
    res.on("error", (error) => {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      span.end();
    });

    next();
  });
}

