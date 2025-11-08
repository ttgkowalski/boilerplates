import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import "reflect-metadata";

const tracer = trace.getTracer("app-tracer");

export interface TraceOptions {
  spanName?: string;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Função helper para instrumentar funções diretamente (sem usar decorator)
 * 
 * @example
 * ```typescript
 * const tracedFunction = traceFunction(
 *   async (data: UserData) => {
 *     // código da função
 *   },
 *   { spanName: "createUser" }
 * );
 * ```
 */
export function traceFunction<T extends (...args: any[]) => any>(
  fn: T,
  options: TraceOptions = {}
): T {
  const spanName = options.spanName || fn.name || "anonymous-function";

  return (async (...args: any[]) => {
    const span = tracer.startSpan(spanName, {
      attributes: {
        "function.name": fn.name || "anonymous",
        ...options.attributes,
      },
    });

    // Adiciona argumentos como atributos (limitado para evitar logs excessivos)
    if (args.length > 0 && args.length <= 5) {
      args.forEach((arg, index) => {
        if (typeof arg === "string" || typeof arg === "number" || typeof arg === "boolean") {
          span.setAttribute(`arg.${index}`, String(arg));
        }
      });
    }

    const activeContext = trace.setSpan(context.active(), span);

    try {
      let result: any;

      await context.with(activeContext, async () => {
        result = await fn(...args);
      });

      span.setStatus({ code: SpanStatusCode.OK });

      // Adiciona resultado como atributo se for simples
      if (result !== undefined && result !== null) {
        if (typeof result === "string" || typeof result === "number" || typeof result === "boolean") {
          span.setAttribute("result", String(result));
        } else if (typeof result === "object" && "id" in result) {
          span.setAttribute("result.id", String(result.id));
        }
      }

      return result;
    } catch (error: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      span.recordException(error);
      span.setAttribute("error.type", error.constructor.name);
      span.setAttribute("error.message", error.message || "Unknown error");

      throw error;
    } finally {
      span.end();
    }
  }) as T;
}

/**
 * Decorator para instrumentar funções criando spans no início e no final da execução
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @Trace({ spanName: "createUser" })
 *   async createUser(data: UserData) {
 *     // código da função
 *   }
 * }
 * ```
 */
export function Trace(options: TraceOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const spanName = options.spanName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const span = tracer.startSpan(spanName, {
        attributes: {
          "function.name": propertyKey,
          "class.name": target.constructor.name,
          ...options.attributes,
        },
      });

      // Adiciona argumentos como atributos (limitado para evitar logs excessivos)
      if (args.length > 0 && args.length <= 5) {
        args.forEach((arg, index) => {
          if (typeof arg === "string" || typeof arg === "number" || typeof arg === "boolean") {
            span.setAttribute(`arg.${index}`, String(arg));
          }
        });
      }

      const activeContext = trace.setSpan(context.active(), span);

      try {
        let result: any;
        
        await context.with(activeContext, async () => {
          result = await originalMethod.apply(this, args);
        });

        span.setStatus({ code: SpanStatusCode.OK });
        
        // Adiciona resultado como atributo se for simples
        if (result !== undefined && result !== null) {
          if (typeof result === "string" || typeof result === "number" || typeof result === "boolean") {
            span.setAttribute("result", String(result));
          } else if (typeof result === "object" && "id" in result) {
            span.setAttribute("result.id", String(result.id));
          }
        }

        return result;
      } catch (error: any) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        
        span.recordException(error);
        span.setAttribute("error.type", error.constructor.name);
        span.setAttribute("error.message", error.message || "Unknown error");

        throw error;
      } finally {
        span.end();
      }
    };

    return descriptor;
  };
}

