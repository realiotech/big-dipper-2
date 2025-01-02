import React from "react";
import ProposalList from "@/components/proposals/list";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

const ProposalsPage = () => {
  const { t } = useTranslation("proposals")
  return (
    <>
      <NextSeo
        title={t('proposals') ?? undefined}
        openGraph={{
          title: t('proposals') ?? undefined,
        }}
      />
      <ProposalList />
    </>
  );
};

export default ProposalsPage;
