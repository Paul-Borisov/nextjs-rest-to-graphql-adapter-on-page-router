// https://hackernoon.com/setting-up-a-graphql-server-and-client-in-nextjs
// https://blog.logrocket.com/complete-guide-to-graphql-playground/
//"server-only"
import { allRestEndpointUris, restApiToGraphqlTypeDefs } from "@/data/typeDefs";
import { ApolloServer, ApolloServerPlugin, BaseContext } from "@apollo/server";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  gql,
} from "apollo-server-core";
import { getRegisteredEntity } from "@/data/utils";
import RestToGraphqlQueryAdapter from "@/data/restToGraphqlQueryAdapter";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const resolvers = { Query: {} };
const definitions: string[] = [];

const filter = process.env.NEXT_PUBLIC_dataSampleFilter || "";

for (const restEndpointUri of allRestEndpointUris) {
  let { rootTypeName } = getRegisteredEntity(restEndpointUri);
  const filterSeparator = restEndpointUri.includes("?") ? "&" : "?";
  const endpointUri = `${restEndpointUri}${
    filter ? `${filterSeparator}${filter}` : ""
  }`;
  try {
    const schema = await restApiToGraphqlTypeDefs(endpointUri, rootTypeName);
    const funcName =
      rootTypeName[0].toLocaleLowerCase() + rootTypeName.substring(1);
    const query = `\n\ntype Query {
    ${funcName}(skip: Int, top: Int): [${rootTypeName}]
    find${rootTypeName}ById(id: [ID]): [${rootTypeName}]
    find${rootTypeName}ByText(text: [String]): [${rootTypeName}]
  }`;
    definitions.push(query);
    definitions.push(schema);
  } catch (e) {
    console.log(restEndpointUri, e);
  }
}
const typeDefs = gql`
  ${definitions.join("")}
`;

for (const restEndpointUri of allRestEndpointUris) {
  let { entityName, rootTypeName } = getRegisteredEntity(restEndpointUri);

  const queryAdapter = new RestToGraphqlQueryAdapter(restEndpointUri);

  let results: Awaited<
    ReturnType<typeof queryAdapter.getGraphqlDataUsingRestLink>
  >;
  try {
    const queryText =
      (await queryAdapter.getGraphqlQueryText(entityName, rootTypeName)) || "";
    if (!queryText) continue;

    results = await queryAdapter.getGraphqlDataUsingRestLink(
      entityName,
      rootTypeName,
      queryText
    );
  } catch (e) {
    console.log(restEndpointUri, e);
    continue;
  }

  const data =
    Object.values(results.data).find((value) => Array.isArray(value)) || [];
  resolvers.Query = {
    ...resolvers.Query,
    ...{
      [entityName]: (
        _: unknown,
        { skip, top }: { skip?: number; top?: number }
      ) => {
        const startIndex = skip && skip > 0 ? skip : 0;
        const endIndex =
          top && data.length > top ? startIndex + top : data.length;
        return data.slice(startIndex, endIndex);
      },
      [`find${rootTypeName}ById`]: (
        _: unknown,
        { id }: { id: [string | number] }
      ) => {
        return data.filter((item: unknown) =>
          id.some((findId) => (item as { id: string | number })?.id == findId)
        );
      },
      [`find${rootTypeName}ByText`]: (
        _: unknown,
        { text }: { text: [string] }
      ) => {
        return data.filter((item: unknown) => {
          return (
            item &&
            item instanceof Object &&
            text.some((partial) => JSON.stringify(item).includes(partial))
          );
        });
      },
    },
  };
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    <ApolloServerPlugin<BaseContext>>(
      ApolloServerPluginLandingPageGraphQLPlayground({
        title: "REST to GraphQL Adapter",
      })
    ),
  ],
});

export default startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({ req, res }),
});
