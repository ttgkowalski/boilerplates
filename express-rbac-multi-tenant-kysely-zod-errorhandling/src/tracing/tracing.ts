import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const traceExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_ENDPOINT || "http://localhost:4318/v1/traces",
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.SERVICE_NAME || "express-rbac-api",
    [SEMRESATTRS_SERVICE_VERSION]: process.env.SERVICE_VERSION || "1.0.0",
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

export function initializeTracing() {
  sdk.start();
  console.log("✅ Tracing inicializado com Jaeger");
  
  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk.shutdown()
      .then(() => console.log("Tracing finalizado"))
      .catch((error) => console.log("Erro ao finalizar tracing", error))
      .finally(() => process.exit(0));
  });
}

export { sdk };

