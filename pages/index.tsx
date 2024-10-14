import { allRestEndpointUris } from "@/data/typeDefs";
import ContentContainer from "@/components/server/ContentContainer";
import ContentHeader from "@/components/server/ContentHeader";
import ContentHome from "@/components/client/ContentHome";
import Head from "next/head";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import localFont from "next/font/local";
import { pageMetadata } from "@/shared/constants/pageMetadata";
import { Repo } from "@/shared/types/repo";
import RestToGraphqlQueryAdapter from "@/data/restToGraphqlQueryAdapter";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const parseParams = (restEndpointUri: string, slug?: string[]) => {
  let modifiedQueryText = "";
  if (!!slug?.length) {
    try {
      restEndpointUri = atob(decodeURIComponent(slug[0]));
      modifiedQueryText =
        slug.length > 1 ? atob(decodeURIComponent(slug[1])) : modifiedQueryText;
      if (!modifiedQueryText.startsWith("query ")) {
        modifiedQueryText = "";
      }
    } catch (e) {
      console.log("ERROR", e);
    }
  }
  return { restEndpointUri, modifiedQueryText };
};

export const getServerSideProps = (async (params) => {
  let restEndpointUri =
    (allRestEndpointUris?.length && allRestEndpointUris[0]) || "";
  let modifiedQueryText = "";
  try {
    const slug = params.params?.slug;
    let showResetToDefault = false;
    if (Array.isArray(slug)) {
      const result = parseParams(restEndpointUri, slug);
      restEndpointUri = result.restEndpointUri;
      modifiedQueryText = result.modifiedQueryText;
      showResetToDefault = true;
    }

    const queryAdapter = new RestToGraphqlQueryAdapter(restEndpointUri);
    let { entityName, rootTypeName } = queryAdapter.getEntity();

    const queryText = modifiedQueryText
      ? modifiedQueryText
      : (await queryAdapter.getGraphqlQueryText(entityName, rootTypeName)) ||
        "";

    const data = queryAdapter.isRegisteredUrl()
      ? await queryAdapter.getGraphqlDataUsingApi(rootTypeName, queryText)
      : await queryAdapter.getGraphqlDataUsingRestLink(
          entityName,
          rootTypeName,
          queryText
        );

    // Pass data to the page via props
    const repo: Repo = {
      data,
      entityName,
      queryText,
      restEndpointUri,
      showResetToDefault,
    };
    return { props: { repo } };
  } catch (e) {
    const errorMessage =
      encodeURIComponent(`${restEndpointUri}: `) +
      (typeof e === "string"
        ? encodeURIComponent(e)
        : e && typeof e === "object"
        ? encodeURIComponent(JSON.stringify(e))
        : encodeURIComponent("Undefined error"));
    return {
      redirect: {
        destination: `/500?errorMessage=${errorMessage}`,
        permanent: false,
      },
    };
  }
}) satisfies GetServerSideProps<{ repo: Repo }>;

export default function HomePage({
  repo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{pageMetadata.title?.toString() || ""}</title>
      </Head>
      <Head>
        <meta
          property="og:description"
          content={pageMetadata.description?.toString() || ""}
          key="description"
        />
      </Head>
      <main
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col gap-5`}
      >
        <ContentContainer>
          <ContentHeader title={process.env.NEXT_PUBLIC_pageheader || ""} />
          <ContentHome payload={repo} />
        </ContentContainer>
      </main>
    </>
  );
}
