'use strict';

function genTelemetry() {
  return `import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export class Telemetry {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  // -------- Core Tracing --------

  startSpan(name) {
    const tracer = trace.getTracer(this.serviceName);
    const span = tracer.startSpan(name, {}, context.active());
    return { tracer, span };
  }

  startChildSpan(parentSpan, name) {
    const tracer = trace.getTracer(this.serviceName);
    const ctx = trace.setSpan(context.active(), parentSpan);
    const span = tracer.startSpan(name, {}, ctx);
    return { tracer, span };
  }

  // -------- Logging Helpers --------

  setLogObject(span, name, events) {
    span.addEvent(this.serviceName, {
      [name]: JSON.stringify(events),
    });
  }

  setLogRequest(span, request) {
    span.addEvent(this.serviceName, {
      request: JSON.stringify(request),
    });
  }

  setLogResponse(span, response) {
    span.addEvent(this.serviceName, {
      response: JSON.stringify(response),
    });
  }

  setLogError(span, error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.addEvent(this.serviceName, {
      error: JSON.stringify(error),
    });
  }

  // -------- Exception + Status --------

  setRecordException(span, error) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : String(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message,
    });
    span.recordException(error instanceof Error ? error : new Error(message));
  }

  /** Records a fatal process-level error as its own span (uncaughtException / unhandledRejection). */
  recordProcessError(kind, error) {
    const { span } = this.startSpan(\`process.\${kind}\`);
    try {
      this.setAttributes(span, { 'process.error.kind': kind });
      this.setRecordException(span, error);
    } finally {
      span.end();
    }
  }

  // -------- Attributes --------

  setAttributes(span, attributes) {
    span.setAttributes(attributes);
  }
}

let sdk;
export let telemetry;

/**
 * Bootstrap OpenTelemetry SDK.
 * Must be called BEFORE any other imports (especially http / express).
 *
 * @param {import('./index.js').AppConfig} config
 */
export function initTelemetry(config) {
  const { name, version } = config.app;
  const exporter = new OTLPTraceExporter({
    url: config.telemetry.endpoint,
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]:    name,
      [SEMRESATTRS_SERVICE_VERSION]: version,
    }),
    spanProcessor: new SimpleSpanProcessor(exporter),
  });

  sdk.start();
  telemetry = new Telemetry(name);
  console.log(\`[Telemetry] OpenTelemetry started — service: \${name}\`);
}

/**
 * Gracefully shut down the SDK (flushes pending spans).
 */
export async function shutdownTelemetry() {
  if (sdk) {
    await sdk.shutdown();
    console.log('[Telemetry] SDK shut down');
  }
}
`;
}

module.exports = { genTelemetry };
