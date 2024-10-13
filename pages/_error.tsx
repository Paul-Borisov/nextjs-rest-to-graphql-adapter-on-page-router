import ErrorPage500 from "./500";
import { NextApiRequest, NextApiResponse } from "next";

function Error({ statusCode }: { statusCode: number }) {
  return (
    <>
      <ErrorPage500>
        <p>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : "An error occurred on client"}
        </p>
      </ErrorPage500>
    </>
  );
}

Error.getInitialProps = ({
  res,
  err,
}: {
  res: NextApiRequest;
  err: NextApiResponse;
}) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
