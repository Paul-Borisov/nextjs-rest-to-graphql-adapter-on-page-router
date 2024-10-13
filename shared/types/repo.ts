import { ApolloQueryResult } from "./apolloQueryResult";

export type Repo = {
  entityName: string;
  data: ApolloQueryResult;
  queryText: string;
  restEndpointUri: string;
  showResetToDefault: boolean;
};
