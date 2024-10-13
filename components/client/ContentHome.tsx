import { AdjustedFormValues } from "@/shared/types/adjustedFormValues";
import { Button, Tooltip } from "@radix-ui/themes";
import { capitalizeFirstLetters } from "@/shared/utils/utils";
import ContentPanel from "../client/ContentPanel";
import dynamic from "next/dynamic";
import FormResetToDefault from "./panels/FormResetToDefault";
import { Repo } from "@/shared/types/repo";
import { useState } from "react";

// Using dynamic loading prevents SSR errors related to unavailable window object
const RightHandSidePanel = dynamic(
  () => import("@/components/client/RightHandSidePanel"),
  { ssr: false }
);

const FormUpdateQueryText = dynamic(
  () => import("@/components/client/panels/FormUpdateQueryText"),
  { ssr: false }
);

export default function ContentHome({ payload }: { payload: Repo }) {
  const [formValues, setFormValues] = useState<AdjustedFormValues>();
  let { data, entityName, queryText, restEndpointUri, showResetToDefault } =
    payload;

  let isNewTab = formValues?.isNewTab ?? false;

  if (formValues?.data) {
    data = formValues.data;
  }
  if (formValues?.entityName) {
    entityName = formValues.entityName;
  }
  if (formValues?.restEndpointUri) {
    restEndpointUri = formValues.restEndpointUri;
  }
  if (formValues?.queryText) {
    queryText = formValues.queryText;
  }
  if (formValues?.isNewTab) {
    isNewTab = formValues.isNewTab;
  }
  const caption = capitalizeFirstLetters(entityName);

  return (
    <ContentPanel caption={caption} data={data} entityName={entityName}>
      {showResetToDefault && <FormResetToDefault />}
      <RightHandSidePanel
        className="!absolute !top-0 right-0 !h-screen !rounded-none"
        title={caption}
        description={"Information on this endpoint"}
        disableLightClosing={/true|1/i.test(
          process.env.disableSidePanelLightClosing || ""
        )}
        controlToOpenDialog={
          <Button className="!w-32 !h-10 !font-semibold !bg-blue-500 hover:!bg-blue-700 !text-white !rounded !cursor-pointer">
            <Tooltip content="Open details in a right-hand side panel">
              <span>Details</span>
            </Tooltip>
          </Button>
        }
      >
        <FormUpdateQueryText
          initialUrl={restEndpointUri}
          initialQueryText={queryText}
          initialIsNewTab={isNewTab}
          setFormValues={setFormValues}
        />
      </RightHandSidePanel>
    </ContentPanel>
  );
}
