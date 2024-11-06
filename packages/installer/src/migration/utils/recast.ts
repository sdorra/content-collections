import * as recast from "recast";

const b = recast.types.builders;

type Property =
  | recast.types.namedTypes.Property
  | recast.types.namedTypes.ObjectProperty;

export function isProperty(property: unknown) {
  return (
    recast.types.namedTypes.Property.check(property) ||
    recast.types.namedTypes.ObjectProperty.check(property)
  );
}

export function propertyHasStringValue(property: Property, value: string) {
  return (
    (property.value.type === "Literal" ||
      property.value.type === "StringLiteral") &&
    property.value.value === value
  );
}

export function findObjectProperty(
  parent: recast.types.namedTypes.ObjectExpression,
  key: string,
) {
  let property = parent.properties.find(
    (prop) =>
      prop.type !== "SpreadElement" &&
      prop.type !== "SpreadProperty" &&
      ((prop.key.type === "Identifier" && prop.key.name === key) ||
        (prop.key.type === "StringLiteral" && prop.key.value === key)),
  );

  if (property && !isProperty(property)) {
    throw new Error(`${key} property is not an ObjectProperty or Property`);
  }

  return property;
}

export function addOrGetObjectProperty(
  parent: recast.types.namedTypes.ObjectExpression,
  key: string,
) {
  let property = findObjectProperty(parent, key);

  if (!property) {
    property = b.property("init", b.identifier(key), b.objectExpression([]));
    parent.properties.push(property);
  }

  const value = property.value;
  if (recast.types.namedTypes.ObjectExpression.check(value)) {
    return value;
  } else {
    throw new Error(`${key} property value is not an ObjectExpression`);
  }
}
