import { ReactNode } from "react";

export default function ContentContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-5 justify-center items-center h-screen">
      {children}
    </article>
  );
}
