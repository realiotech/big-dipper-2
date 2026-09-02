import type { NextApiRequest, NextApiResponse } from "next";
import { fetchUsdPrices } from "@/utils/spot_prices";

const ASSET_METADATA = [
    {
        denom: 'ario',
        symbol: 'RIO',
        name: 'Realio Network',
        description: 'Realio Network Token',
        image: '/images/assets/RIO.png',
        decimals: 18,
        price: 1
    },
    {
        denom: 'arst',
        symbol: 'RST',
        name: 'Realio Security Token',
        description: 'An equity token that scales with our technology so you can take part in Realio\'s growth.',
        image: '/images/assets/RST.png',
        decimals: 18,
        price: 1
    },
    {
        denom: 'almx',
        symbol: 'LMX',
        name: 'Liquid Mining Fund',
        description: 'LMX is a fully tokenized special-purpose vehicle that provides exposure to Bitcoin mining. It focuses on immersion cooling technology and sustainable power sources such as hydroelectric power.',
        image: '/images/assets/LMX.png',
        decimals: 18,
        price: 1
    },
    {
        denom: 'erc20:0xb841F365D5221Bed66d60E69094418D8C2aa5A44',
        symbol: 'DSTRX',
        name: 'District token',
        description: 'Districts token for LandBank',
        image: '/images/assets/DSTRX.png',
        decimals: 18,
        price: 1
    }
]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // One batched request to the freehold spot-price API (REA-3126)
        // instead of a fetch per symbol against the v1 asset-api. A symbol
        // with no usable price source (`unresolved` upstream - LMX today)
        // degrades to price 0, same as the previous per-symbol failure path.
        const prices = await fetchUsdPrices(ASSET_METADATA.map((item) => item.symbol));
        res.status(200).json(ASSET_METADATA.map((item) => ({
            ...item,
            price: prices[item.symbol.toUpperCase()] ?? 0,
        })));
    } catch (error) {
        console.error("Error fetching asset prices:", error);
        // Return default metadata with price 0 on error (missing env included) instead of 500
        res.status(200).json(ASSET_METADATA.map(item => ({ ...item, price: 0 })));
    }
}
