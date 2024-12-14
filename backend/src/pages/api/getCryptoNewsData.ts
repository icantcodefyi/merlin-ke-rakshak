import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
    methods: ['POST'], // Specify the allowed methods
    origin: 'http://localhost:5173', // Your Vite frontend URL
    credentials: true,
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

const idMap = {
    "Coin": "name",
    "Holding": "holding",
    "Symbol": "id"
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { data } = req.body;
    try {
        // Run the middleware
        await runMiddleware(req, res, cors);

        const transformedData = data.map((item: {
            Coin: string,
            Symbol: string,
            Holding: string
        }) => ({
            id: item.Symbol,
            name: item.Coin,
            holding: item.Holding
        }))

        const baseUrl = "https://api.coinpaprika.com/v1";

        // Fetch basic coin details and market data
        const coinDetails = await Promise.all(transformedData.map(coin => axios.get(`${baseUrl}/coins/${coin.id}`)));
        const marketData = await Promise.all(transformedData.map(coin => axios.get(`${baseUrl}/tickers/${coin.id}`)));

        // Fetch latest crypto news from CryptoCompare
        const newsResponse = await axios.get("https://min-api.cryptocompare.com/data/v2/news/", {
            params: { lang: "EN" },
            headers: { Authorization: `Apikey 45772842c9a7895b7e8798091cd51fcf2ad6e384ed9482894911f54d5e89b965` },
        });

        const latestNews = newsResponse.data.Data.slice(0, 5); // Get top 5 news articles

        // Format coin data for WhatsApp
        const coinMessage = transformedData
            .map((coin, index) => {
                const market = marketData[index].data;
                const detail = coinDetails[index].data;

                const currentValue = (coin.holding * market.quotes.USD.price).toFixed(2);

                return (
                    `*${detail.name} (${detail.symbol})*
`
                    + `💰 Current Price: $${market.quotes.USD.price.toFixed(2)}
`
                    + `📈 24h Change: ${market.quotes.USD.percent_change_24h.toFixed(2)}%
`
                    + `📊 Market Cap: $${market.quotes.USD.market_cap.toLocaleString()}
`
                    + `🏆 All-Time High: $${market.quotes.USD.ath_price.toFixed(2)}
`
                    + `💼 Holding: ${coin.holding} units
`
                    + `💸 Total Value: $${currentValue}
\n`
                );
            })
            .join("");

        // Format news data for WhatsApp
        const newsMessage = latestNews
            .map((news) => {
                return `📰 *${news.title}* ${news.url}`;
            })
            .join("\n\n");

        // Combine coin data and news into the WhatsApp message
        const finalMessage = `🪙 *Crypto Portfolio Update* 🪙\n\n${coinMessage}🔔 *Latest Crypto News:*\n\n${newsMessage}\n\n⚡ Powered by MerlinFlow`;

        return res.status(200).json({ data: finalMessage, status: 'success' });
    } catch (error) {
        console.error('Error sending notification:', error);

        return res.status(500).json({
            error: 'Failed to send notification.',
            details: error,
        });
    }
}