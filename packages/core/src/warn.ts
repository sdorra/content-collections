let logDeprecated = true;

export function configureDeprecatedWarnings(enabled: boolean) {
  logDeprecated = enabled;
}

type Logger = (message: string) => void;

export function warnDeprecated(message: string, logger: Logger = console.warn) {
  if (!logDeprecated) {
    return;
  }
  logger(`[CC DEPRECATED]: ${message}`);
}
