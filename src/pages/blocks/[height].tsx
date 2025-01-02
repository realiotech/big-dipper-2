import BlockDetails from "@/components/blocks/detail";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

const BlockDetailsPage = () => {
  const { t } = useTranslation("blocks")
  return (
    <>
      <NextSeo
        title={t('blockDetails') ?? undefined}
        openGraph={{
          title: t('blockDetails') ?? undefined,
        }}
      />
      <BlockDetails />
    </>
  );
};

export default BlockDetailsPage;
