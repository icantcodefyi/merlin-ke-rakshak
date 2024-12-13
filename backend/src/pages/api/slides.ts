import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract the slide URL from the query parameters
    const { slideUrl } = req.query;

    // Validate the URL
    if (!slideUrl || !slideUrl.includes('export?format=txt')) {
        return res.status(400).json({ error: 'Invalid or missing slideUrl. Ensure it includes export/txt.' });
    }

    try {
        // Fetch the slide content
        const response = await axios.get(slideUrl as string, {
            responseType: 'text', // Expect plain text
        });

        // Send the text content as the response
        return res.status(200).json({ content: response.data });
    } catch (error) {
        console.error('Error fetching slide content:', error);

        // Handle errors gracefully
        return res.status(500).json({
            error: 'Failed to fetch slide content. Ensure the slide is publicly accessible.',
            details: error,
        });
    }
}
