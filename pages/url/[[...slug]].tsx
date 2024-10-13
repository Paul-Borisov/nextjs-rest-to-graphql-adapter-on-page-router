import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import HomePage, { getServerSideProps as parentProps } from "../index";
import { Repo } from "@/shared/types/repo";

export const getServerSideProps = (async (params) => {
  return parentProps(params);
}) satisfies GetServerSideProps<{ repo: Repo }>;

export default function SubPage({
  repo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <HomePage repo={repo} />;
}
