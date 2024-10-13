import { mergeProperties } from "./utils";

export type GraphQLSchemaInput = {
  [key: string]:
    | string
    | number
    | boolean
    | GraphQLSchemaInput
    | GraphQLSchemaInput[];
};

export const allRestEndpointUris = [
  ...(process.env.NEXT_PUBLIC_restEndpoints?.split(/,|,?\n/)
    .map((url) => url.trim())
    .filter((url) => url) || []),
];

// create store => CreateStore
// create_store => CreateStore
// create - store => CreateStore
export function pascalCase(value: string): string {
  return value
    ?.replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (_, c) => (c ? c.toUpperCase() : ""));
}

export async function restApiToGraphqlTypeDefs(
  restEndpointUri: string,
  rootTypeName: string = "Item"
): Promise<string> {
  const data = await fetch(restEndpointUri).then((r) => r.json());

  let itemsArray;

  if (Array.isArray(data)) {
    itemsArray = data;
  } else {
    itemsArray = Object.values(data).find((value) => Array.isArray(value));
  }

  if (!itemsArray) {
    throw new Error("No array found in the API response");
  }

  let summaryObject: GraphQLSchemaInput = {};
  itemsArray?.forEach((obj: GraphQLSchemaInput) => {
    summaryObject = mergeProperties(summaryObject, obj);
  });

  const mapTypes = new Map<string, string>();
  const generatedTypes = new Set<string>();

  function resolveType(value: GraphQLSchemaInput, fieldName: string): string {
    if (value === null || value === undefined) {
      return "String";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "[String]"; // Default to array of String for empty arrays
      }
      // Assume homogeneous arrays
      const arrayType = resolveType(value[0], fieldName);
      return `[${arrayType}]`;
    }

    switch (typeof value) {
      case "string":
        return "String";
      case "number":
        return Number.isInteger(value) ? "Int" : "Float";
      case "boolean":
        return "Boolean";
      case "object":
        // Nested object
        const typeName = pascalCase(fieldName);
        if (!generatedTypes.has(typeName)) {
          const typeDef = generateTypeDef(value, typeName);
          mapTypes.set(typeName, typeDef);
          generatedTypes.add(typeName);
        }
        return typeName;
      default:
        return "String";
    }
  }

  function generateTypeDef(obj: GraphQLSchemaInput, typeName: string): string {
    let fields = "";
    for (const [key, val] of Object.entries(obj)) {
      const fieldType = resolveType(val as GraphQLSchemaInput, key);
      fields += `  ${key}: ${fieldType}\n`;
    }
    return `type ${typeName} {\n${fields}}`;
  }

  // Start generating types from the root items
  const rootFieldsSet: { [key: string]: GraphQLSchemaInput } = {};

  for (const [key, value] of Object.entries(summaryObject)) {
    if (!(key in rootFieldsSet) || rootFieldsSet[key] === null) {
      rootFieldsSet[key] = value as GraphQLSchemaInput;
    }
  }

  const rootTypeDef = generateTypeDef(rootFieldsSet, rootTypeName);
  mapTypes.set(rootTypeName, rootTypeDef);

  // Combine all type definitions
  const schema = [...mapTypes.values()].join("\n");

  return schema;
}
