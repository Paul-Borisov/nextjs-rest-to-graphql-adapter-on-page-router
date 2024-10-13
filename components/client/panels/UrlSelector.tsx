import { allRestEndpointUris } from "@/data/typeDefs";
import { getRegisteredEntity } from "@/data/utils";
import RestToGraphqlQueryAdapter from "@/data/restToGraphqlQueryAdapter";
import { Select } from "@radix-ui/themes";
import { splitByUppercaseLetters } from "@/shared/utils/utils";

type Props = {
  defaultUrl: string;
  onValueChange: (value: string) => void;
};

export default function UrlSelector({ defaultUrl, onValueChange }: Props) {
  const allUrls = Array.from(
    // Ensure that values do not repeat
    new Set([...allRestEndpointUris, defaultUrl])
  );

  return (
    <Select.Root defaultValue={defaultUrl} onValueChange={onValueChange}>
      <Select.Trigger variant="soft" />
      <Select.Content>
        {allUrls.map((url) => {
          let entity = getRegisteredEntity(url);
          if (!entity) {
            const queryAdapter = new RestToGraphqlQueryAdapter(url);
            entity = queryAdapter.getEntity();
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
