import type { NextApiRequest, NextApiResponse } from "next";

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
]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const apiUrl = process.env.PRICE_API_URL;
    const apiKey = process.env.PRICE_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: "Missing API_URL or API_KEY in environment variables" });
    }

    try {
        let promises = []
        for (let i = 0; i < ASSET_METADATA.length; i++) {
            promises.push(fetch(`${apiUrl}/${ASSET_METADATA[i].symbol.toUpperCase()}`, {
                headers: {
                    "x-api-key": apiKey,
                },
            }))
        }

        const response = await Promise.all(promises);
        let resJsonPromises = []

        for (let i = 0; i < response.length; i++) {
            if (!response[i].ok) {
                throw new Error(`API request failed with status ${response[i].status}`);
            }
            resJsonPromises.push(response[i].json())
        }
        const resJson = await Promise.all(resJsonPromises);


        res.status(200).json(ASSET_METADATA.map((item, index) => ({ ...item, price: resJson[index]?.USD ?? 0 })));
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}
