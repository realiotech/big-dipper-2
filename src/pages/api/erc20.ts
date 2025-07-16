import type { NextApiRequest, NextApiResponse } from "next";

const ERC20_METADATA = [
    {
        address: process.env.NEXT_PUBLIC_CHAIN_TYPE == "testnet" ? "0x9b81cFe34C25131DaE2248c5e508829a3b52518b" : "0xb841f365d5221bed66d60e69094418d8c2aa5a44",
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
    const apiUrl = process.env.PRICE_API_URL;
    const apiKey = process.env.PRICE_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(200).json(ERC20_METADATA);
    }

    try {
        let promises = []
        for (let i = 0; i < ERC20_METADATA.length; i++) {
            promises.push(fetch(`${apiUrl}/${ERC20_METADATA[i].symbol.toUpperCase()}`, {
                headers: {
                    "x-api-key": apiKey,
                },
            }))
        }

        const response = await Promise.all(promises);
        let resJsonPromises = []

        for (let i = 0; i < response.length; i++) {
            if (!response[i].ok) {
                console.warn(`API request failed for ${ERC20_METADATA[i].symbol} with status ${response[i].status}`);
                resJsonPromises.push(Promise.resolve(null));
            } else {
                resJsonPromises.push(response[i].json());
            }
        }
        const resJson = await Promise.all(resJsonPromises);

        res.status(200).json(ERC20_METADATA.map((item, index) => ({ 
            ...item, 
            price: resJson[index]?.USD ?? 0 
        })));
    } catch (error) {
        console.error("Error fetching token prices:", error);
        res.status(200).json(ERC20_METADATA);
    }
}
