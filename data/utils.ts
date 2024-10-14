import {
  allRestEndpointUris,
  GraphQLSchemaInput,
  pascalCase,
} from "./typeDefs";
import { RegisteredEntity } from "@/shared/types/registeredEntity";

const mapUriToEntityName = new Map<string, RegisteredEntity>();
const ensureMapUriToEntityName = () => {
  if (mapUriToEntityName.size) return;
  const uniqueEntityNames = new Set<string>();
  const uniqueEntries = new Set<string>();
  for (const restEndpointUri of allRestEndpointUris) {
    const uniqueEntry = restEndpointUri
      .toLocaleLowerCase()
      .replace(/\/´+$/, "")
      .trim();
    if (uniqueEntries.has(uniqueEntry)) {
      continue;
    }
    uniqueEntries.add(uniqueEntry);

    const uri = new URL(restEndpointUri);
    const pathname = uri.pathname;
    let entityName = pathname.substring(pathname.lastIndexOf("/") + 1);
    if (uniqueEntityNames.has(entityName)) {
      //let suffix = uri.host.replace(/\./g, "-");
      let suffix = uri.host.replace(/\..+/, "");
      if (suffix[0].toLocaleLowerCase() === suffix[0].toLocaleUpperCase()) {
        // if the first character is not a letter, add the leading letter
        suffix = `z${suffix}`;
      }
      entityName += `-${suffix}`;
    }
    uniqueEntityNames.add(entityName);
    const rootTypeName = pascalCase(entityName);
    const obj: RegisteredEntity = {
      entityName:
        rootTypeName[0].toLocaleLowerCase() + rootTypeName.substring(1),
      rootTypeName: rootTypeName,
    };
    mapUriToEntityName.set(restEndpointUri, obj);
  }
};

export const getRegisteredEntity = (restEndpointUri: string) => {
  ensureMapUriToEntityName();
  return mapUriToEntityName.get(restEndpointUri)!;
};

export const findArrayOfObjects = (rootObject: GraphQLSchemaInput) => {
  if (!rootObject) {
    throw "Invalid JSON format (empty)";
  }
  if (Array.isArray(rootObject)) return rootObject;

  for (const key of Object.keys(rootObject)) {
    const obj = rootObject[key];
    if (Array.isArray(obj)) return obj;
  }

  throw "Undetermined JSON format: array of objects not found";
};

export const getNewEntity = (restEndpointUri: string) => {
  const pathname = new URL(restEndpointUri).pathname;
  let entityName = pathname.substring(pathname.lastIndexOf("/") + 1);
  const rootTypeName = pascalCase(entityName);
  entityName = rootTypeName[0].toLocaleLowerCase() + rootTypeName.substring(1);
  const newEntity: RegisteredEntity = { entityName, rootTypeName };
  return newEntity;
};

const traverseObject = (obj: GraphQLSchemaInput): string[] => {
  const rows: string[] = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (Array.isArray(value)) {
      // Handle arrays here if necessary (currently skipped)
      return;
    } else if (typeof value === "object" && Object.keys(value).length > 0) {
      rows.push(key);
      rows.push("{");
      rows.push(...traverseObject(value as GraphQLSchemaInput));
      rows.push("}");
    } else {
      rows.push(key);
    }
  });

  return rows;
};

const formatRows = (rows: string[]) => {
  const separator = " ".repeat(4);
  let result = ["{"];
  let openCurlyBracesCounter = 1;
  rows.forEach((s) => {
    if (s === "{") {
      openCurlyBracesCounter += 1;
      result.push(" {");
      return;
    } else if (s === "}") {
      openCurlyBracesCounter -= 1;
    }
    result.push(`\n${separator.repeat(openCurlyBracesCounter)}${s}`);
  });
  result.push("\n  }");
  return result.join("");
};

export const objectToGraphqlSchema = (obj: GraphQLSchemaInput): string => {
  return formatRows(traverseObject(obj));
};

export const mergeProperties = (
  summaryObject: GraphQLSchemaInput,
  source: GraphQLSchemaInput
) => {
  let target = { ...summaryObject };
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) {
          target[key] = {};
        }
        target[key] = mergeProperties(
          <GraphQLSchemaInput>target[key],
          source[key]
        );
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};
