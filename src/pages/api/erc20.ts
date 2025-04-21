import type { NextApiRequest, NextApiResponse } from "next";

const ERC20_METADATA = [
    {
        address: process.env.NEXT_PUBLIC_CHAIN_TYPE == "testnet" ? "0xcc2bcda0674252bc65b185eb25c31fe7157ad30a" : "0xb841f365d5221bed66d60e69094418d8c2aa5a44",
        symbol: 'DSTRX',
        name: 'Districts token',
        description: 'Districts token for LandBank',
        image: '/images/assets/DSTRX.png',
        decimals: 18,
        price: 0
    },
]

export default async function handler(
    _: NextApiRequest,
    res: NextApiResponse
) {
    res.status(200).json(ERC20_METADATA);
}
