import type { NextApiRequest, NextApiResponse } from "next";

const ERC20_METADATA = [
    {
        address: '0xcc2bcda0674252bc65b185eb25c31fe7157ad30a',
        symbol: 'DSTRX',
        name: 'District token',
        description: 'District token for LandBank',
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
