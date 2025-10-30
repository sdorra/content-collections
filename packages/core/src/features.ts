const deprecations = {
  implicitContentProperty: `The implicit addition of a content property to schemas is deprecated.
Please add an explicit content property to your schema.
For more information, see:
https://content-collections.dev/docs/deprecations/implicit-content-property`,
};

type Deprecation = keyof typeof deprecations;

const _suppressDeprecatedWarnings: Array<Deprecation> = [];

export function suppressDeprecatedWarnings(
  ...suppresses: Array<Deprecation | "all">
) {
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

export function deprecated(
  deprecation: Deprecation,
  logger: Logger = console.warn,
) {
  if (_suppressDeprecatedWarnings.includes(deprecation)) {
    return;
  }
  logger(`[CC DEPRECATED]: ${deprecations[deprecation]}`);
}

const retiredFeatures = {
  legacySchema: `The use of a function as a schema is retired.
Please use a StandardSchema compliant library directly.
For more information, see:
https://content-collections.dev/docs/deprecations/schema-as-function`,
};

type RetiredFeature = keyof typeof retiredFeatures;

export class RetiredFeatureError extends Error {
  readonly feature: RetiredFeature;
  constructor(feature: RetiredFeature) {
    super(`This feature has been removed:\n${retiredFeatures[feature]}`);
    this.feature = feature;
    this.name = "RetiredFeatureError";
    // Maintain proper prototype chain (important when targeting ES5)
    Object.setPrototypeOf(this, RetiredFeatureError.prototype);
  }
}

export function isRetiredFeatureError(
  error: unknown,
): error is RetiredFeatureError {
  return error instanceof RetiredFeatureError;
}

export function retired(feature: RetiredFeature): never {
  throw new RetiredFeatureError(feature);
}
