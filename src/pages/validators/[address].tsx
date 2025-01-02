import React from "react";
import ValidatorDetails from "@/components/validators/detail";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

export default function ValidatorDetailPage() {
    const { t } = useTranslation("validators")
    return (
        <>
            <NextSeo
                title={t('validatorDetails') ?? undefined}
                openGraph={{
                    title: t('validatorDetails') ?? undefined,
                }}
            />
            <ValidatorDetails />
        </>
    );
}
