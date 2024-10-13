import FormButton from "@/components/server/panels/FormButton";
import { FormEvent } from "react";
import { NextRouter, useRouter } from "next/router";

// This is not in use, kept as an example of reset using server side Form Action
const formAction = async (
  e: FormEvent<HTMLFormElement>,
  router: NextRouter
) => {
  e.preventDefault();
  router.push("/");
};

export default function FormResetToDefault() {
  const router = useRouter();
  return (
    <form onSubmit={(e) => formAction(e, router)}>
      <FormButton text="Reset to default" />
    </form>
  );
}
