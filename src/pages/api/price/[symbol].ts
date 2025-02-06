import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { symbol } = req.query;
    const apiUrl = process.env.PRICE_API_URL;
    const apiKey = process.env.PRICE_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: "Missing API_URL or API_KEY in environment variables" });
    }

    try {
        const response = await fetch(`${apiUrl}/${symbol}`, {
            headers: {
                "x-api-key": apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}
