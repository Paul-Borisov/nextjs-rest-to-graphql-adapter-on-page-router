// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ApiResponseQueryText } from "@/shared/types/apiResponses";
import { Globals } from "@/shared/constants/globals";
import type { NextApiRequest, NextApiResponse } from "next";
import RestToGraphqlQueryAdapter from "@/data/restToGraphqlQueryAdapter";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ApiResponseQueryText>
) {
  if (request.method === "POST") {
    const payload: unknown = await request.body;

    if (!payload || typeof payload !== "object") {
      throw new Error("Payload is undefined or invalid");
    }
    if (!(Globals.paramRestRequestUri in payload)) {
      throw new Error(`${Globals.paramRestRequestUri} is undefined`);
    }

    const restEndpointUri = payload[
      Globals.paramRestRequestUri as keyof typeof payload
    ] as string;

    const queryAdapter = new RestToGraphqlQueryAdapter(restEndpointUri);
    let { entityName, rootTypeName } = queryAdapter.getEntity();

    const queryText =
      (await queryAdapter.getGraphqlQueryText(entityName, rootTypeName)) || "";

    response.status(200).json({ queryText });
  } else {
    response.status(404).errored;
  }
}
