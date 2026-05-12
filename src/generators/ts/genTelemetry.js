'use strict';

function genTelemetry() {
  return `import type { AppConfig } from './index';
import { trace, context, Span, Tracer, SpanStatusCode, Attributes } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export class Telemetry {
  constructor(private readonly serviceName: string) {}

  // -------- Core Tracing --------

  startSpan(name: string): { tracer: Tracer; span: Span } {
    const tracer = trace.getTracer(this.serviceName);
    const span = tracer.startSpan(name, {}, context.active());
    return { tracer, span };
  }

  startChildSpan(parentSpan: Span, name: string): { tracer: Tracer; span: Span } {
    const tracer = trace.getTracer(this.serviceName);
    const ctx = trace.setSpan(context.active(), parentSpan);
    const span = tracer.startSpan(name, {}, ctx);
    return { tracer, span };
  }

  // -------- Logging Helpers --------

  setLogObject(span: Span, name: string, events: any) {
    span.addEvent(this.serviceName, {
      [name]: JSON.stringify(events),
    });
  }

  setLogRequest(span: Span, request: any) {
    span.addEvent(this.serviceName, {
      request: JSON.stringify(request),
    });
  }

  setLogResponse(span: Span, response: any) {
    span.addEvent(this.serviceName, {
      response: JSON.stringify(response),
    });
  }

  setLogError(span: Span, error: Error | any) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.addEvent(this.serviceName, {
      error: JSON.stringify(error),
    });
  }

  // -------- Exception + Status --------

  setRecordException(span: Span, error: Error | any) {
    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : String(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message,
    });
    span.recordException(error instanceof Error ? error : new Error(message));
  }

  /** Records a fatal process-level error as its own span (uncaughtException / unhandledRejection). */
  recordProcessError(kind: 'uncaughtException' | 'unhandledRejection', error: Error) {
    const { span } = this.startSpan(\`process.\${kind}\`);
    try {
      this.setAttributes(span, { 'process.error.kind': kind });
      this.setRecordException(span, error);
    } finally {
      span.end();
    }
  }

  // -------- Attributes --------

  setAttributes(span: Span, attributes: Attributes) {
    span.setAttributes(attributes);
  }
}

let sdk: NodeSDK | undefined;
export let telemetry: Telemetry;

/**
 * Bootstrap OpenTelemetry SDK.
 * Must be called BEFORE any other imports (especially http / express).
 *
 * @param {AppConfig} config
 */
export function initTelemetry(config: AppConfig): void {
  const { name, version } = config.app;

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: name,
      [ATTR_SERVICE_VERSION]: version,
    }),
    traceExporter: new OTLPTraceExporter({
      url: config.telemetry.endpoint,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();
  telemetry = new Telemetry(name);
  console.log(\`[Telemetry] OpenTelemetry started — service: \${name}\`);
}

/**
 * Gracefully shut down the SDK (flushes pending spans).
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    console.log('[Telemetry] SDK shut down');
  }
}
`;
}

module.exports = { genTelemetry };
