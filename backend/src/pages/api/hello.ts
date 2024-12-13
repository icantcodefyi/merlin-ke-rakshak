import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

const cors = Cors({
    methods: ['GET'],
    origin: 'http://localhost:5173',
    credentials: true,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result)
            }
            return resolve(result)
        })
    })
}

const generateData = () => {
    const products = [
        {
            id: 1,
            name: "iPhone 14 Pro",
            price: 999.99,
            category: "Electronics",
            stock: 50,
            rating: 4.8,
            description: "Latest Apple iPhone with advanced camera system"
        },
        {
            id: 2,
            name: "Samsung 4K TV",
            price: 799.99,
            category: "Electronics",
            stock: 30,
            rating: 4.5,
            description: "55-inch Smart TV with HDR"
        },
        {
            id: 3,
            name: "Nike Air Max",
            price: 129.99,
            category: "Footwear",
            stock: 100,
            rating: 4.6,
            description: "Comfortable running shoes"
        }
    ];

    const news = [
        {
            id: 1,
            title: "SpaceX Launches New Satellite",
            category: "Technology",
            date: "2024-01-20",
            author: "John Smith",
            summary: "SpaceX successfully launches 60 new Starlink satellites"
        },
        {
            id: 2,
            title: "New Breakthrough in Renewable Energy",
            category: "Science",
            date: "2024-01-19",
            author: "Sarah Johnson",
            summary: "Scientists develop more efficient solar panels"
        },
        {
            id: 3,
            title: "Global Economic Forum Begins",
            category: "Business",
            date: "2024-01-18",
            author: "Michael Brown",
            summary: "World leaders gather to discuss economic challenges"
        }
    ];

    const upcomingEvents = [
        {
            id: 1,
            name: "Tech Conference 2024",
            date: "2024-03-15",
            location: "San Francisco",
            price: 299.99,
            availableSeats: 1000
        },
        {
            id: 2,
            name: "Music Festival",
            date: "2024-04-20",
            location: "Los Angeles",
            price: 149.99,
            availableSeats: 5000
        },
        {
            id: 3,
            name: "Food & Wine Expo",
            date: "2024-05-10",
            location: "New York",
            price: 79.99,
            availableSeats: 2000
        }
    ];

    const trendingTopics = [
        {
            id: 1,
            topic: "Artificial Intelligence",
            mentions: 50000,
            trend: "up",
            relatedTags: ["AI", "Machine Learning", "Technology"]
        },
        {
            id: 2,
            topic: "Climate Change",
            mentions: 45000,
            trend: "up",
            relatedTags: ["Environment", "Global Warming", "Sustainability"]
        },
        {
            id: 3,
            topic: "Cryptocurrency",
            mentions: 30000,
            trend: "down",
            relatedTags: ["Bitcoin", "Blockchain", "Finance"]
        }
    ];

    return {
        products,
        news,
        upcomingEvents,
        trendingTopics
    };
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await runMiddleware(req, res, cors)

    if (req.method === 'GET') {
        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            data: generateData(),
            meta: {
                version: '1.0.0',
                environment: 'development'
            }
        })
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}