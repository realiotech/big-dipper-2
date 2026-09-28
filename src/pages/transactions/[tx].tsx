import { useRouter } from "next/router";
import TransactionDetails from "@/components/transactions/detail";
import EvmTransactionDetails from "@/components/transactions/evm_detail";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

const TransactionPage = () => {
  const { t } = useTranslation("transactions")
  const router = useRouter();
  const isEvm = String(router.query.tx ?? "").startsWith("0x");
  return (
    <>
      <NextSeo
        title={t('transactionDetails') ?? undefined}
        openGraph={{
          title: t('transactionDetails') ?? undefined,
        }}
      />
      {isEvm ? <EvmTransactionDetails /> : <TransactionDetails />}
    </>
  );
};

export default TransactionPage;