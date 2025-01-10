import AccountDetail from "@/components/accounts";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";
export default function AccountDetailPage() {
    const { t } = useTranslation("accounts")

    return (
        <>
            <NextSeo
                title={t('accountDetails') ?? undefined}
                openGraph={{
                    title: t('accountDetails') ?? undefined,
                }}
            />
            <AccountDetail />
        </>
    )
}

