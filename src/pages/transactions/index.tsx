import { TransactionList } from "@/components/transactions/list";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

export default function Transactions() {
    const { t } = useTranslation("transactions")
    return (
        <>
            <NextSeo
                title={t('transactions') ?? undefined}
                openGraph={{
                    title: t('transactions') ?? undefined,
                }}
            />
            <TransactionList />
        </>
    );
}
