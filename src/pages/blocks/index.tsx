import { BlockList } from "@/components/blocks/list";
import { NextSeo } from "next-seo";
import useTranslation from "next-translate/useTranslation";

const Blocks = () => {
    const { t } = useTranslation("blocks")
    return (
        <>
            <NextSeo
                title={t('blocks') ?? undefined}
                openGraph={{
                    title: t('blocks') ?? undefined,
                }}
            />
            <BlockList />
        </>
    );
};

export default Blocks;
