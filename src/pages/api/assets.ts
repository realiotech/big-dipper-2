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
    const apiUrl = process.env.PRICE_API_URL;
    const apiKey = process.env.PRICE_API_KEY;

    // If API credentials are missing, return default metadata with price 0
    if (!apiUrl || !apiKey) {
        return res.status(200).json(ASSET_METADATA.map(item => ({ ...item, price: 0 })));
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
                console.warn(`API request failed for ${ASSET_METADATA[i].symbol} with status ${response[i].status}`);
                // Push null for failed requests instead of throwing
                resJsonPromises.push(Promise.resolve(null));
            } else {
                resJsonPromises.push(response[i].json());
            }
        }
        const resJson = await Promise.all(resJsonPromises);

        res.status(200).json(ASSET_METADATA.map((item, index) => ({ ...item, price: resJson[index]?.USD ?? 0 })));
    } catch (error) {
        console.error("Error fetching asset prices:", error);
        // Return default metadata with price 0 on error instead of 500
        res.status(200).json(ASSET_METADATA.map(item => ({ ...item, price: 0 })));
    }
}
