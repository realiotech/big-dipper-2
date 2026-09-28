import { NextSeo } from "next-seo";
import ContractDetails from "@/components/contracts/detail";

export default function ContractPage() {
  return (
    <>
      <NextSeo title="Contract details" openGraph={{ title: "Contract details" }} />
      <ContractDetails />
    </>
  );
}
