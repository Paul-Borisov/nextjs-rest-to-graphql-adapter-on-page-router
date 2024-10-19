import { allRestEndpointUris } from "@/data/typeDefs";
import { getRegisteredEntity } from "@/data/utils";
import RestToGraphqlQueryAdapter from "@/data/restToGraphqlQueryAdapter";
import { Select } from "@radix-ui/themes";
import { splitByUppercaseLetters } from "@/shared/utils/utils";

type Props = {
  selectedUrl: string;
  onValueChange: (value: string) => void;
};

export default function UrlSelector({ selectedUrl, onValueChange }: Props) {
  const allUrls = Array.from(
    // Ensure that values do not repeat
    new Set([...allRestEndpointUris, selectedUrl])
  );

  return (
    <Select.Root value={selectedUrl} onValueChange={onValueChange}>
      <Select.Trigger variant="soft" />
      <Select.Content>
        {allUrls.map((url) => {
          let entity = getRegisteredEntity(url);
          if (!entity) {
            const queryAdapter = new RestToGraphqlQueryAdapter(url);
            try {
              entity = queryAdapter.getEntity();
            } catch (e) {
              console.log(e);
              return;
            }
          }
          return (
            <Select.Item key={url} value={url}>
              {splitByUppercaseLetters(entity.rootTypeName, " from ")}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
