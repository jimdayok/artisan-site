import { performance } from "node:perf_hooks";

export const DEFAULT_HEARTBEAT_MS = 15_000;

function formatDuration(milliseconds) {
  if (milliseconds < 1_000) return `${Math.round(milliseconds)}ms`;
  return `${(milliseconds / 1_000).toFixed(1)}s`;
}

function memorySnapshot() {
  const usage = process.memoryUsage();
  const toMb = (bytes) => Math.round(bytes / 1024 / 1024);
  return {
    rssMb: toMb(usage.rss),
    heapUsedMb: toMb(usage.heapUsed),
    externalMb: toMb(usage.external),
  };
}

function progressText(progress) {
  if (!progress) return "";
  const processed = Number(progress.processed);
  const total = Number(progress.total);
  if (Number.isFinite(processed) && Number.isFinite(total)) {
    return ` processed=${processed}/${total}`;
  }
  if (Number.isFinite(processed)) return ` processed=${processed}`;
  return "";
}

export class PricingProgress {
  constructor({
    prefix = "pricing",
    profile = false,
    heartbeatMs = DEFAULT_HEARTBEAT_MS,
    log = console.log,
    errorLog = console.error,
  } = {}) {
    this.prefix = prefix;
    this.profile = profile;
    this.heartbeatMs = heartbeatMs;
    this.log = log;
    this.errorLog = errorLog;
    this.records = [];
    this.peakRssMb = memorySnapshot().rssMb;
  }

  snapshot() {
    const memory = memorySnapshot();
    this.peakRssMb = Math.max(this.peakRssMb, memory.rssMb);
    return memory;
  }

  line(event, stage, startedAt, progress) {
    const elapsedMs = performance.now() - startedAt;
    const memory = this.snapshot();
    return `[${this.prefix}] event=${event} stage="${stage}" elapsed=${formatDuration(
      elapsedMs
    )}${progressText(progress)} rss=${memory.rssMb}MB heap=${memory.heapUsedMb}MB external=${memory.externalMb}MB`;
  }

  async run(stage, operation, { getProgress } = {}) {
    const startedAt = performance.now();
    this.log(this.line("start", stage, startedAt, getProgress?.()));

    const heartbeat = setInterval(() => {
      this.log(this.line("heartbeat", stage, startedAt, getProgress?.()));
    }, this.heartbeatMs);
    heartbeat.unref();

    try {
      const result = await operation();
      const elapsedMs = performance.now() - startedAt;
      const memory = this.snapshot();
      this.records.push({
        stage,
        elapsedMs,
        ...memory,
        progress: getProgress?.() ?? null,
      });
      this.log(this.line("complete", stage, startedAt, getProgress?.()));
      return result;
    } catch (error) {
      this.errorLog(
        `${this.line("failed", stage, startedAt, getProgress?.())} error=${JSON.stringify(
          error instanceof Error ? error.message : String(error)
        )}`
      );
      if (error instanceof Error && !error.message.startsWith(`[${stage}]`)) {
        error.message = `[${stage}] ${error.message}`;
      }
      throw error;
    } finally {
      clearInterval(heartbeat);
    }
  }

  printProfile() {
    if (!this.profile) return;
    this.log(`[${this.prefix}] profile-summary stages=${this.records.length} peakRss=${this.peakRssMb}MB`);
    for (const record of this.records) {
      this.log(
        `[${this.prefix}] profile stage="${record.stage}" elapsed=${formatDuration(
          record.elapsedMs
        )} rss=${record.rssMb}MB heap=${record.heapUsedMb}MB external=${record.externalMb}MB${progressText(
          record.progress
        )}`
      );
    }
  }
}

export function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
