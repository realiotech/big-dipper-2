import React from "react";
import ValidatorList from "@/components/validators/list";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

export default function ValidatorsPage() {
  const { t } = useTranslation("validators")
  return (
    <>
      <NextSeo
        title={t('validators') ?? undefined}
        openGraph={{
          title: t('validators') ?? undefined,
        }}
      />
      <ValidatorList />
    </>
  );
}
