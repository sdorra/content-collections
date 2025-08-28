const deprecations = {
  legacySchema: `The use of a function as a schema is deprecated.
Please use a StandardSchema compliant library directly.
For more information, see:
https://content-collections.dev/docs/deprecations/schema-as-function`,
};

type Deprecation = keyof typeof deprecations;

const _suppressDeprecatedWarnings: Array<Deprecation> = [];

export function suppressDeprecatedWarnings(...suppresses: Array<Deprecation | "all">) {
  for (const deprecation of suppresses) {
    if (deprecation === "all") {
      _suppressDeprecatedWarnings.push(
        ...(Object.keys(deprecations) as Array<Deprecation>),
      );
      return;
    } else {
      _suppressDeprecatedWarnings.push(deprecation);
    }
  }
}

export function clearSuppressedWarnings() {
  _suppressDeprecatedWarnings.length = 0;
}

type Logger = (message: string) => void;

export function warnDeprecated(
  deprecation: Deprecation,
  logger: Logger = console.warn,
) {
  if (_suppressDeprecatedWarnings.includes(deprecation)) {
    return;
  }
  logger(`[CC DEPRECATED]: ${deprecations[deprecation]}`);
}
