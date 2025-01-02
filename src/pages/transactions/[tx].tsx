import TransactionDetails from "@/components/transactions/detail";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

const TransactionPage = () => {
  const { t } = useTranslation("transactions")
  return (
    <>
      <NextSeo
        title={t('transactionDetails') ?? undefined}
        openGraph={{
          title: t('transactionDetails') ?? undefined,
        }}
      />
      <TransactionDetails />
    </>
  );
};

export default TransactionPage;