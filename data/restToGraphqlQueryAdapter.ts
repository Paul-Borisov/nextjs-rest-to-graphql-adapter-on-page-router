import { allRestEndpointUris, GraphQLSchemaInput } from "./typeDefs";
import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client";
import getApolloCLient from "./apolloClient";
import {
  findArrayOfObjects,
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

  constructor(restEndpointUri: string) {
    const endpointUri = restEndpointUri;
    this.client = getApolloCLient(endpointUri, true, responseTransformer);
    this.restEndpointUri = endpointUri;
  }

  isRegisteredUrl = () => {
    return allRestEndpointUris.some(
      (url) =>
        url.toLocaleLowerCase() === this.restEndpointUri.toLocaleLowerCase()
    );
  };

  getApiKey = () => process.env.apiKeyRest || ""; // Get you API key or auth token here

  private async getObjectSamplesRest(
    filter: string = process.env.NEXT_PUBLIC_dataSampleFilter || ""
  ) {
    const filterSeparator = this.restEndpointUri.includes("?") ? "&" : "?";
    return await fetch(
      `${this.restEndpointUri}${filter ? `${filterSeparator}${filter}` : ""}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${this.getApiKey()}` },
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
    queryText: string
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

    const authToken = this.getApiKey();

    const result = this.client.query({
      query,
      context: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
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
      entityName = existingEntity.entityName;
      rootTypeName = existingEntity.rootTypeName;
    } else {
      const newEntity = getNewEntity(this.restEndpointUri);
      entityName = newEntity.entityName;
      rootTypeName = newEntity.rootTypeName;
    }

    const entity: RegisteredEntity = { entityName, rootTypeName };
    return entity;
  }
}
