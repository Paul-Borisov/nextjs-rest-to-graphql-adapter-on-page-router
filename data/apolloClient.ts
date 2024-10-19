//import "server-only";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { RestLink } from "apollo-link-rest";

const singletonForRestLink = (link: RestLink) => {
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};

const singletonForUrl = (endpointUri: string) => {
  return new ApolloClient({
    uri: endpointUri,
    cache: new InMemoryCache(),
    // defaultOptions: {
    //   watchQuery: {
    //     fetchPolicy: "no-cache",
    //     errorPolicy: "ignore",
    //   },
    //   query: {
    //     fetchPolicy: "no-cache",
    //     errorPolicy: "all",
    //   },
    // },
  });
};

declare const globalThis: {
  apolloClientGlobal: Record<
    string,
    ReturnType<typeof singletonForUrl | typeof singletonForRestLink>
  >;
} & typeof global;

const getApolloCLient = (
  endpointUri: string,
  restLinkToOrigin: boolean = true,
  responseTransformer: RestLink.ResponseTransformer | undefined
) => {
  globalThis.apolloClientGlobal = globalThis.apolloClientGlobal || {};
  if (restLinkToOrigin) {
    const origin = new URL(endpointUri).origin;
    let client = globalThis.apolloClientGlobal[origin];
    if (!client) {
      const link = new RestLink({
        uri: origin,
        responseTransformer,
      });
      client = singletonForRestLink(link);
      globalThis.apolloClientGlobal[origin] = client;
    }
    return client;
  } else {
    let client = globalThis.apolloClientGlobal[endpointUri];
    if (!client) {
      client = singletonForUrl(endpointUri);
      globalThis.apolloClientGlobal[endpointUri] = client;
    }
    return client;
  }
};

export default getApolloCLient;
