import OpenAI from "openai";
const openai = new OpenAI();
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { context } = req.body;

    try {
        console.log("context", context);

        const structuredPrompt = `
            Generate a PowerPoint presentation based on the following context:

            ${context}

            The presentation must include:

            A title slide with the main topic.
            Content slides that break down the context into key sections with bullet points, visuals, or charts as applicable.
            A conclusion slide summarizing the context.
            A professional, clean, and visually appealing template.
            Provide the downloadable URL for the PowerPoint file only as the response. The response must not include any explanation, examples, or additional information.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-2024-11-20",
            messages: [
                { role: "system", content: "You are a PPT generator. You only respond with the downloadable URL for the PowerPoint file." },
                {
                    role: "user",
                    content: structuredPrompt,
                },
            ],
        });

        const responseData = completion?.choices[0]?.message

        return res.status(200).json({ pptUrl: responseData?.content });
    } catch (error) {
        console.error('Error fetching slide content:', error);

        // Handle errors gracefully
        return res.status(500).json({
            error: 'Failed to fetch slide content. Ensure the slide is publicly accessible.',
            details: error,
        });
    }
}
