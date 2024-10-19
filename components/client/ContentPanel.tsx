"use client"; // App Router compatible

import { ApolloQueryResult } from "@/shared/types/apolloQueryResult";
import { formatData } from "../server/utils";
import { ReactNode, useMemo } from "react";
import { splitByUppercaseLetters } from "@/shared/utils/utils";

export default function ContentPanel({
  children,
  caption,
  data,
  entityName,
}: {
  children: ReactNode;
  caption: string;
  data: ApolloQueryResult;
  entityName: string;
}) {
  const rootObjectName = entityName.toLocaleLowerCase();
  const header = useMemo(
    () => (
      <section className="flex justify-between w-[98vw] pl-4 pr-1 relative top-3 right-4 max-lg:mt-20">
        <div className="text-3xl font-semibold opacity-40">
          {splitByUppercaseLetters(caption, " from ")}
        </div>
        <div className="flex gap-5">{children}</div>
      </section>
    ),
    [caption, children]
  );

  const tableContent = useMemo(
    () => (
      <section className="w-[100%] h-auto overflow-y-auto whitespace-pre-wrap break-words text-[90%] flex justify-center">
        <div className="w-fit h-[calc(100vh_-_80px)] max-w-[100%]">
          {formatData(data, rootObjectName)}
        </div>
      </section>
    ),
    [data, rootObjectName]
  );

  return (
    <>
      {header}
      {tableContent}
    </>
  );
}
