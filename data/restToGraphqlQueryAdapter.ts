import { allRestEndpointUris, GraphQLSchemaInput } from "./typeDefs";
import {
  ApolloClient,
  FetchPolicy,
  NormalizedCacheObject,
  gql,
} from "@apollo/client";
import getApolloCLient from "./apolloClient";
import {
  findArrayOfObjects,
  getApiKeyForRestEndpointUri,
  getNewEntity,
  getRegisteredEntity,
  mergeProperties,
  objectToGraphqlSchema,
} from "./utils";
import { RegisteredEntity } from "@/shared/types/registeredEntity";

const responseTransformer = async (response: Response) => {
  const json = await response.json();
  return findArrayOfObjects(json); // Extract the first array
};

export default class RestToGraphqlQueryAdapter {
  private client: ApolloClient<NormalizedCacheObject>;
  private restEndpointUri: string;
  public headers: Record<string, string> = {};

  constructor(restEndpointUri: string, apiKey?: string) {
    const endpointUri = restEndpointUri;
    this.client = getApolloCLient(endpointUri, true, responseTransformer);
    this.restEndpointUri = endpointUri;
    if (!apiKey) {
      const isClient = typeof window !== "undefined";
      if (!isClient) {
        const apiKey = this.isRegisteredUrl()
          ? getApiKeyForRestEndpointUri(restEndpointUri)
          : undefined;
        this.addAuthorizationHeader(apiKey);
      }
    } else {
      this.addAuthorizationHeader(apiKey);
    }
  }

  addAuthorizationHeader(apiKey?: string) {
    if (apiKey) {
      this.headers["Authorization"] = `Bearer ${apiKey}`;
    }
  }

  isRegisteredUrl = () => {
    return allRestEndpointUris.some((url) => {
      if (
        url.toLocaleLowerCase() === this.restEndpointUri.toLocaleLowerCase()
      ) {
        return true;
      }
      const reStripSearchParams = /(\?|#).+/;
      const urlPath = url.replace(reStripSearchParams, "").toLocaleLowerCase();
      const testPath = this.restEndpointUri
        ?.replace(reStripSearchParams, "")
        .toLocaleLowerCase();
      return urlPath === testPath;
    });
  };

  private async getObjectSamplesRest(
    filter: string = process.env.NEXT_PUBLIC_dataSampleFilter || ""
  ) {
    const filterSeparator = this.restEndpointUri.includes("?") ? "&" : "?";
    return await fetch(
      `${this.restEndpointUri}${filter ? `${filterSeparator}${filter}` : ""}`,
      {
        method: "GET",
        headers: this.headers,
      }
    )
      .then((r) => {
        if (r.ok) {
          return r.json();
        } else {
          return `${r.status}: ${r.statusText}`;
        }
      })
      .catch((e) => e);
  }

  checkInputArgs(entityName: string, queryText: string) {
    if (!entityName || !queryText) {
      const name = entityName ? entityName : "entityNameUndefined";
      return Promise.resolve({
        data: { [name]: [] }, // Return empty data
        loading: false,
        networkStatus: 7, // Apollo client uses network status codes, 7 typically means "stopped"
        stale: false,
        errors: undefined,
      } as Awaited<ReturnType<typeof this.client.query>>);
    }
    return undefined;
  }

  async getGraphqlDataUsingRestLink(
    entityName: string,
    rootTypeName: string,
    queryText: string,
    headers: Record<string, string> = {}, // Use custom headers, for instance, to customize the authorization scenario
    fetchPolicy: FetchPolicy = "no-cache"
  ) {
    const error = this.checkInputArgs(entityName, queryText);
    if (error) return error;

    const url = new URL(this.restEndpointUri);
    let newQueryText = queryText.replace(
      / {\n\s+[^\s]* {/,
      ` {\n  ${entityName} @rest(type: "${rootTypeName}", path: "${
        url.pathname
      }${url.search ? `${url.search}` : ""}") {`
    );

    const query = gql`
      ${newQueryText}
    `;
    let mergedHeaders: GraphQLSchemaInput = {};
    mergedHeaders = mergeProperties(mergedHeaders, this.headers);
    mergedHeaders = mergeProperties(mergedHeaders, headers);
    const result = this.client.query({
      query,
      context: {
        headers: mergedHeaders,
      },
      fetchPolicy,
    });

    return result;
  }

  async getGraphqlDataUsingApi(
    rootTypeName: string,
    queryText: string,
    originUri?: string
  ) {
    const error = this.checkInputArgs(rootTypeName, queryText);
    if (error) return error;

    const query = {
      operationName: rootTypeName,
      variables: {},
      query: `${queryText}`,
    };

    // Adding authToken is made at /api/graphql that eventually calls getGraphqlDataUsingRestLink,
    // which in its turn injects authToken (look at the code above)
    const result = await fetch(
      `${originUri ?? process.env.__NEXT_PRIVATE_ORIGIN}/api/graphql`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(query),
      }
    )
      .then((r) => {
        if (r.ok) {
          return r.json();
        } else {
          return `${r.status}: ${r.statusText}`;
        }
      })
      .then((json) => json as Awaited<ReturnType<typeof this.client.query>>);

    return result;
  }

  async getGraphqlQueryText(entityName: string, rootTypeName: string) {
    const objectSamples = findArrayOfObjects(await this.getObjectSamplesRest());

    let summaryObject: GraphQLSchemaInput = {};
    objectSamples?.forEach((obj: GraphQLSchemaInput) => {
      summaryObject = mergeProperties(summaryObject, obj);
    });

    const querySchema = objectToGraphqlSchema(summaryObject);

    return `query ${rootTypeName} {\n  ${entityName} ${querySchema}\n}`;
  }

  getEntity() {
    let entityName, rootTypeName;
    if (this.isRegisteredUrl()) {
      const existingEntity = getRegisteredEntity(this.restEndpointUri);
      entityName = existingEntity?.entityName;
      rootTypeName = existingEntity?.rootTypeName;
    }
    if (!(entityName && rootTypeName)) {
      const newEntity = getNewEntity(this.restEndpointUri);
      entityName = newEntity.entityName;
      rootTypeName = newEntity.rootTypeName;
    }

    const entity: RegisteredEntity = { entityName, rootTypeName };
    return entity;
  }
}

export class RestToGraphqlQueryAdapterClient extends RestToGraphqlQueryAdapter {}
