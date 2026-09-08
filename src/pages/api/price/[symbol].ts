import type { NextApiRequest, NextApiResponse } from "next";
import { fetchSpotPrices } from "@/utils/spot_prices";

// Per-symbol price passthrough. Now backed by the freehold spot-price API
// (REA-3126) instead of the v1 asset-api; the response keeps the v1 shape -
// a fiat price map like { "USD": 0.51 } - for any external caller.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { symbol } = req.query;

    if (!process.env.PRICE_API_URL || !process.env.PRICE_API_KEY) {
        return res.status(500).json({ error: "Missing API_URL or API_KEY in environment variables" });
    }

    try {
        const normalized = String(symbol).toUpperCase();
        const { data } = await fetchSpotPrices([normalized]);
        const entry = data[normalized];

        if (!entry) {
            // Reported as `unresolved` upstream (no usable price source -
            // LMX today) or unknown; "no price", not a server error.
            return res.status(404).json({ error: `No price available for ${symbol}` });
        }

        res.status(200).json(entry.price);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}
