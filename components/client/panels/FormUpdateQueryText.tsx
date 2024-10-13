import AdjustFormFields from "./AdjustFormFields";
import { AdjustedFormValues } from "@/shared/types/adjustedFormValues";
import { ApiResponseQueryText } from "@/shared/types/apiResponses";
import { Checkbox, Flex } from "@radix-ui/themes";
import {
  ChangeEvent,
  Dispatch,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from "react";
import ClientFormButton from "./ClientFormButton";
import { Globals } from "@/shared/constants/globals";
import Link from "next/link";
import UrlSelector from "./UrlSelector";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useRefresh } from "@/shared/hooks/useRefresh";

export type FormUpdateQueryTextProps = {
  initialUrl: string;
  initialQueryText: string;
  initialIsNewTab: boolean;
  setFormValues: Dispatch<SetStateAction<AdjustedFormValues | undefined>>;
};

export default function FormUpdateQueryText({
  initialUrl,
  initialQueryText,
  initialIsNewTab,
  setFormValues,
}: FormUpdateQueryTextProps) {
  const [isNewTab, setIsNewTab] = useState(initialIsNewTab);
  const [url, setUrl] = useState(initialUrl);
  const [queryText, setQueryText] = useState(initialQueryText);
  const [errorMessage, setErrorMessage] = useState("");
  const refTextArea = useRef<HTMLTextAreaElement>(null);
  const refLink = useRef<HTMLAnchorElement>(null);
  const refRefresh = useRef(false);
  const refresh = useRefresh();

  const fetchQueryText = async (paramRestRequestUri: string) => {
    const body = JSON.stringify({
      [Globals.paramRestRequestUri]: paramRestRequestUri,
    });
    return fetch("/api/querytext", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    })
      .then((r) => {
        if (r.ok) {
          return r.json();
        } else {
          return r.text();
        }
      })
      .then((r) => r)
      .catch((e) => {
        console.log(e);
        return {};
      });
  };

  const getQueryText = useDebounce(async (newValue: string) => {
    if (newValue) {
      const json: ApiResponseQueryText = await fetchQueryText(newValue);
      if (typeof json === "object") {
        setQueryText(json.queryText);
        refRefresh.current = true;
      } else if (typeof json === "string") {
        const text = json as string;
        const m = text.match(/"message"\:"([^"]+)"/);
        setErrorMessage(m ? m[1] : "Something went wrong");
      }
    }
  }, 500);

  const href = url
    ? `/url/${btoa(url)}${queryText ? `/${btoa(queryText)}` : ""}`
    : "/";

  const clearQueryText = () => {
    if (refTextArea.current) {
      refTextArea.current.value = "";
    }
    setQueryText("");
  };

  const handleCheck = () => {
    setIsNewTab(!isNewTab);
    setFormValues((prev) => ({ ...prev, isNewTab: !isNewTab }));
  };

  const handleSelectedValue = async (newValue: string) => {
    clearQueryText();
    setErrorMessage("");
    setUrl(newValue);
    getQueryText(newValue);
  };

  const handleSubmit = () => refLink.current?.click();

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    handleSelectedValue(e.target.value);
  };

  const handleQuery = () => {
    refRefresh.current = true;
    setErrorMessage("");
    refresh();
  };

  let changeHome: ReactNode = null;
  if (refRefresh.current) {
    changeHome = (
      <AdjustFormFields
        initialUrl={url}
        initialQueryText={queryText}
        initialIsNewTab={isNewTab}
        setErrorMessage={setErrorMessage}
        setFormValues={setFormValues}
      />
    );
    setTimeout(() => (refRefresh.current = false));
  }

  return (
    <>
      {changeHome}
      <div className="flex gap-5 items-center pb-3">
        <div className="font-semibold">REST API URL</div>
        <UrlSelector
          defaultUrl={initialUrl}
          onValueChange={handleSelectedValue}
        />
        <div className="text-red-600">{errorMessage}</div>
      </div>
      <input
        name="url"
        type="text"
        value={url}
        className="w-[100%] h-6 outline outline-1 p-2 mb-5"
        onChange={handleUrlChange}
      />
      <div className="flex justify-between">
        <div className="font-semibold pb-1">GraphQL Query</div>
        <ClientFormButton text="Test" onClick={handleQuery} className="-mt-4" />
      </div>
      <textarea
        ref={refTextArea}
        name="queryText"
        className="w-[100%] h-[67vh] outline outline-1 p-3"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
      />
      <div className="flex gap-10 justify-end items-center pt-5">
        <Flex gap="2" className="!items-center">
          <Checkbox defaultChecked={isNewTab} onCheckedChange={handleCheck} />
          Open in a new tab
        </Flex>
        <Link
          ref={refLink}
          href={href}
          target={isNewTab ? "_blank" : "_self"}
          className="hidden"
        />
        <ClientFormButton text="Submit" onClick={handleSubmit} />
      </div>
    </>
  );
}
