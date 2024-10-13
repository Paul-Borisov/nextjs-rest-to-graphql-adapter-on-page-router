import ContentContainer from "@/components/server/ContentContainer";
import ContentHeader from "@/components/server/ContentHeader";
import Link from "next/link";
import { pageMetadata } from "@/shared/constants/pageMetadata";
import { ReactNode } from "react";
import { useSearchParams } from "next/navigation";

function ErrorPage500({ children }: { children?: ReactNode }) {
  const searchParams = useSearchParams();
  const errorMessage = searchParams?.get("errorMessage");

  return (
    <>
      <title>{pageMetadata.title?.toString() || ""}</title>
      <meta
        property="og:description"
        content={pageMetadata.description?.toString() || ""}
        key="description"
      />
      <main className="flex flex-col gap-5">
        <ContentContainer>
          <ContentHeader title={process.env.NEXT_PUBLIC_pageheader || ""} />
          <p className="text-3xl">Something went wrong</p>
          <p className="text-3xl">{errorMessage}</p>
          {children}
          <Link href="/" className="underline text-xl">
            &raquo; Back to site
          </Link>
        </ContentContainer>
      </main>
    </>
  );
}

export default ErrorPage500;
