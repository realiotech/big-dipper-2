import { NextSeo } from "next-seo";
import { NotFound } from "@/components/explorer/not_found";

export default function NotFoundPage() {
  return (
    <>
      <NextSeo title="Not found" noindex />
      <NotFound />
    </>
  );
}
