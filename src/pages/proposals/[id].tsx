import React from "react";
import ProposalDetail from "@/components/proposals/detail";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

const ProposalDetailPage = () => {
  const { t } = useTranslation("proposals")
  return (
    <>
      <NextSeo
        title={t('proposalDetails') ?? undefined}
        openGraph={{
          title: t('proposalDetails') ?? undefined,
        }}
      />
      <ProposalDetail />
    </>
  );
};

export default ProposalDetailPage;