import Layout from "@src/components/layout/layout";
import { ThemeProvider } from "next-themes"
import { AppProps } from "next/app"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import React from 'react';
import { RecoilRoot } from 'recoil';
import { DefaultSeo } from 'next-seo';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '@src/graphql/client';
import { chainConfig } from '@configs';
import { useWindowOrigin } from '@hooks';
import {
    OPEN_GRAPH_SEO,
    TWITTER_SEO,
    ADDITIONAL_LINK_TAGS_SEO,
    ADDITIONAL_META_TAGS,
    SEO_TITLE,
    SEO_DESCRIPTION,
} from './utils';

export default function App({ Component, pageProps }: AppProps) {
    const apolloClient = useApollo(pageProps.initialApolloState);
    const { location } = useWindowOrigin();

    return (
        <>
            <DefaultSeo
                titleTemplate={`%s | ${chainConfig.title}`}
                title={SEO_TITLE}
                description={SEO_DESCRIPTION}
                openGraph={{
                    title: `${chainConfig.title}`,
                    description: SEO_DESCRIPTION,
                    url: location,
                    ...OPEN_GRAPH_SEO,
                }}
                twitter={TWITTER_SEO}
                additionalLinkTags={ADDITIONAL_LINK_TAGS_SEO}
                additionalMetaTags={ADDITIONAL_META_TAGS}
            />
            <ApolloProvider
                client={apolloClient}
            >
                <RecoilRoot>
                    <ChakraProvider value={defaultSystem}>
                        <ThemeProvider attribute="class" disableTransitionOnChange>
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                        </ThemeProvider>
                    </ChakraProvider>
                </RecoilRoot>
            </ApolloProvider>
        </>
    )
}