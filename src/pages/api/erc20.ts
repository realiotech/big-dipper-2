import type { NextApiRequest, NextApiResponse } from "next";
import { fetchUsdPrices } from "@/utils/spot_prices";

const ERC20_METADATA = [
    {
        address: process.env.NEXT_PUBLIC_CHAIN_TYPE == "testnet" ? "0x9b81cFe34C25131DaE2248c5e508829a3b52518b" : "0xb841F365D5221Bed66d60E69094418D8C2aa5A44",
        symbol: 'DSTRX',
        name: 'Districts token',
        description: 'Districts token for LandBank',
        image: '/images/assets/DSTRX.png',
        decimals: 18,
        price: 0
    },
]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Batched freehold spot-price call (REA-3126); replaces the v1
        // asset-api per-symbol fetch. Unresolved symbols degrade to price 0.
        const prices = await fetchUsdPrices(ERC20_METADATA.map((item) => item.symbol));
        res.status(200).json(ERC20_METADATA.map((item) => ({
            ...item,
            price: prices[item.symbol.toUpperCase()] ?? 0,
        })));
    } catch (error) {
        console.error("Error fetching token prices:", error);
        res.status(200).json(ERC20_METADATA);
    }
}
