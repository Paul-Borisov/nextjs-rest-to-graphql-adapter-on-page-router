import { FormUpdateQueryTextProps } from "./FormUpdateQueryText";
import { RestToGraphqlQueryAdapterClient } from "@/data/restToGraphqlQueryAdapter";

function AdjustFormFields({
  apiKeyEnteredOnClient,
  initialUrl: restEndpointUri,
  initialQueryText: queryText,
  initialIsNewTab,
  setErrorMessage,
  setFormValues,
}: FormUpdateQueryTextProps & {
  apiKeyEnteredOnClient?: string;
  setErrorMessage: (value: string) => void;
}) {
  const getData = async () => {
    try {
      const queryAdapter = new RestToGraphqlQueryAdapterClient(restEndpointUri);
      const isAdHocUrl = !queryAdapter.isRegisteredUrl();
      if (isAdHocUrl) {
        queryAdapter.addAuthorizationHeader(apiKeyEnteredOnClient);
      }
      let { entityName, rootTypeName } = queryAdapter.getEntity();

      const origin =
        typeof window !== undefined ? window.location.origin : undefined;
      let data = queryAdapter.isRegisteredUrl()
        ? await queryAdapter.getGraphqlDataUsingApi(
            rootTypeName,
            queryText,
            origin
          )
        : await queryAdapter.getGraphqlDataUsingRestLink(
            entityName,
            rootTypeName,
            queryText
          );

      // Scheduling a macrotask to run after setTimeout scheduled in the parent component.
      setTimeout(() => {
        if (typeof data === "string") {
          setErrorMessage(data);
          return null;
        }

        if (data) {
          let newEntityName = new URL(restEndpointUri).pathname;
          newEntityName = newEntityName
            .substring(newEntityName.lastIndexOf("/") + 1)
            .toLocaleLowerCase();
          setFormValues({
            data,
            entityName: newEntityName,
            restEndpointUri,
            queryText,
            isNewTab: initialIsNewTab,
          });
          setErrorMessage("");
        }
      });
    } catch (e: unknown) {
      if (
        !e &&
        e instanceof Object &&
        "message" in e &&
        typeof e["message"] === "string"
      ) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage("Something went wrong");
      }
    }
  };
  getData();

  return null;
}

export default AdjustFormFields;
