//import "server-only";

import { ApolloQueryResult } from "@/shared/types/apolloQueryResult";
import Link from "next/link";

const formatLinkUrl = (value: string, returnUrl: string) => {
  return `${returnUrl}${returnUrl.endsWith("/") ? "" : "/"}${value}`;
};
const formatTableView = (
  results: JSX.Element[],
  key: string,
  value: string,
  uniqueKey: string,
  returnUrl: string
) => {
  if (key === "code") {
    results.push(
      <li key={uniqueKey}>
        <Link
          className="underline font-semibold text-blue-500 hover:text-blue-700 dark:hover:text-white"
          href={formatLinkUrl(value, returnUrl)}
        >
          {value}
        </Link>
      </li>
    );
  } else {
    results.push(<li key={uniqueKey}>{value}</li>);
  }
};

const formatKeyValueView = (
  results: JSX.Element[],
  key: string,
  value: string,
  uniqueKey: string
) => {
  results.push(
    <li key={uniqueKey} className="grid grid-cols-2">
      <div className="font-semibold capitalize">{key}</div>
      <div>{value}</div>
    </li>
  );
};

export const formatData = (
  data: ApolloQueryResult,
  rootObjectName: string = "employees",
  keyValue: boolean = false,
  returnUrl: string = "/"
) => {
  // type guarding
  if (!(data && data instanceof Object)) return null;
  if (!("data" in data && data.data instanceof Object)) return null;

  let root;
  if (
    rootObjectName in data.data &&
    Array.isArray(data.data[rootObjectName as keyof typeof data.data])
  ) {
    // For instance, if data.data.employees
    root = Array(...data.data[rootObjectName]);
  } else {
    // For instance, if data.employees
    root = Object.values(data).find((value) => Array.isArray(value));
    if (!root) {
      // For instance, if data.data.findEmployeesById where findEmployeesById is key[0]
      const keys = Object.keys(data.data).filter(
        (key) => key[0].toLocaleLowerCase() !== key[0].toLocaleUpperCase()
      );
      if (keys.length) {
        root = Array.isArray(data.data[keys[0]])
          ? Array(...data.data[keys[0]])
          : Array(data.data[keys[0]]);
      }
    }
  }
  if (!root) return null;

  const headers = new Set<string>();
  const results: JSX.Element[] = [];
  const templateRow: Record<string, string | number | boolean> = {};
  const customClassName = `custom-grid-${rootObjectName}`;
  const rowClass = keyValue
    ? "grid gap-3"
    : `grid gap-3 p-5 ${customClassName}`;
  //const root = Array(...data.data[rootObjectName]);

  root.forEach((dataEntry, index) => {
    const columnValues: JSX.Element[] = [];
    if (!dataEntry) return columnValues;
    Object.keys(dataEntry).forEach((key) => {
      if (
        key?.startsWith("__") ||
        dataEntry[key] instanceof Object ||
        typeof dataEntry[key] === "undefined"
      ) {
        return;
      }

      if (!headers.has(key)) headers.add(key);

      const uniqueKey = key + index;
      if (keyValue) {
        formatKeyValueView(columnValues, key, dataEntry[key], uniqueKey);
      } else {
        formatTableView(
          columnValues,
          key,
          dataEntry[key],
          uniqueKey,
          returnUrl
        );
      }
      if (index === 0) templateRow[key] = dataEntry[key];
    });
    results.push(
      <ol className={rowClass} key={dataEntry["id"] ?? `entryrow-${index}`}>
        {columnValues}
      </ol>
    );
  });

  if (!keyValue) {
    results.unshift(
      <ol className={rowClass} key={"kv-0"}>
        {Array.from(headers).map((header) => (
          <li className="font-semibold capitalize" key={header + "-2"}>
            {header}
          </li>
        ))}
      </ol>
    );
    results.push(
      <style
        key="customstyle-1"
        dangerouslySetInnerHTML={{
          __html: `.${customClassName} {grid-template-columns:repeat(${headers.size}, calc(80vw / ${headers.size}));}`,
        }}
      ></style>
    );
  }

  return results;
};
