import "@/styles/globals.css";
import type { AppProps } from "next/app";

//export const dynamic = "force-dynamic"; // This works in layout.tsx as well as in page.tsx
// This is a more elegant solution for PROD builds as any page.tsx that uses this layout will be cached for 15 seconds.
// To cache only specific pages, move this code snippet into corresponding page.tsx
export const revalidate = /^\d+$/.test(process.env.pagecachetimeout || "")
  ? Number(process.env.pagecachetimeout)
  : false;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
