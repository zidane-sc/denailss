type LogLevel = "INFO" | "WARN" | "ERROR";

export function serverLog(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = JSON.stringify({ level, message, ...(context ? { context } : {}) });
  if (level === "ERROR") console.error(entry);
  else if (level === "WARN") console.warn(entry);
  else console.info(entry);
}
