import { FormUpdateQueryTextProps } from "./FormUpdateQueryText";
import RestToGraphqlQueryAdapter from "@/data/restToGraphqlQueryAdapter";

function AdjustFormFields({
  initialUrl: restEndpointUri,
  initialQueryText: queryText,
  initialIsNewTab,
  setErrorMessage,
  setFormValues,
}: FormUpdateQueryTextProps & { setErrorMessage: (value: string) => void }) {
  const getData = async () => {
    const queryAdapter = new RestToGraphqlQueryAdapter(restEndpointUri);
    let { entityName, rootTypeName } = queryAdapter.getEntity();

    const origin =
      typeof window !== undefined ? window.location.origin : undefined;
    const data = queryAdapter.isRegisteredUrl()
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
    }
  };
  getData();

  return null;
}

export default AdjustFormFields;
