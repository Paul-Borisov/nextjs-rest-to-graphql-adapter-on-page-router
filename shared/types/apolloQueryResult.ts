import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

const obj = new ApolloClient({ uri: "", cache: new InMemoryCache() }).query({
  query: gql``,
});

export type ApolloQueryResult = Awaited<typeof obj>;
