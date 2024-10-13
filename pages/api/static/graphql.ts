// https://hackernoon.com/setting-up-a-graphql-server-and-client-in-nextjs
// https://blog.logrocket.com/complete-guide-to-graphql-playground/
import { ApolloServer, ApolloServerPlugin, BaseContext } from "@apollo/server";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  gql,
} from "apollo-server-core";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const typeDefs = gql`
  type Employees {
    id: ID!
    userPrincipalName: String
    displayName: String
    jobTitle: String
    department: String
    city: String
    country: String
    companyName: String
    officeLocation: String
    onPremisesExtensionAttributes: onPremisesExtensionAttributes
    manager: String
    managerUpn: String
  }

  type onPremisesExtensionAttributes {
    extensionAttribute1: String
    extensionAttribute2: String
    extensionAttribute3: String
    extensionAttribute4: String
    extensionAttribute5: String
    extensionAttribute6: String
    extensionAttribute7: String
    extensionAttribute8: String
    extensionAttribute9: String
    extensionAttribute10: String
    extensionAttribute11: String
    extensionAttribute12: String
    extensionAttribute13: String
    extensionAttribute14: String
    extensionAttribute15: String
  }

  type Query {
    employees(skip: Int, top: Int): [Employees]
    findEmployeesById(id: [ID]): [Employees]
    findEmployeesByText(text: [String]): [Employees]
  }
`;

const data =
  (require("@/public/employees.json")
    ?.employees as (typeof typeDefs.definitions)[0][]) || [];

const resolvers = {
  Query: {
    employees: (_: unknown, { skip, top }: { skip?: number; top?: number }) => {
      const startIndex = skip && skip > 0 ? skip : 0;
      const endIndex =
        top && data.length > top ? startIndex + top : data.length;
      return data.slice(startIndex, endIndex);
    },
    findEmployeesById: (_: unknown, { id }: { id: [string | number] }) => {
      return data.filter((item: unknown) =>
        id.some((findId) => (item as { id: string | number })?.id == findId)
      );
    },
    findEmployeesByText: (_: unknown, { text }: { text: [string] }) => {
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

// Logic with any
/*const data = require("/public/employees.json")?.employees || [];

const resolvers = {
  Query: {
    employees: () => data,
    findEmployeesById: (_: unknown, { id }: { id: string | number }) => {
      return data?.find((item: { id: string }) => item?.id == id) || {};
    },
    findEmployeesByText: (_: unknown, { text }: { text: string }) => {
      return (
        data?.filter((item: any) => {
          return (
            item && item instanceof Object && JSON.stringify(item).includes(text)
          );
        }) || []
      );
    },
  },
};*/

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    <ApolloServerPlugin<BaseContext>>(
      ApolloServerPluginLandingPageGraphQLPlayground()
    ),
  ],
});

export default startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({ req, res }),
});
