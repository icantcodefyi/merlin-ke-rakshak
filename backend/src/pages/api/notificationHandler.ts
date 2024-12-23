import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import Cors from 'cors';
import { Resend } from "resend";

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


const resend = new Resend("re_U2tm7tUb_5RNp7pxGrFpiZXhSNr8pWJHQ");

async function sendEmailNotification(
    email: string, sheetUrl: string) {
    console.log("email", email);

    const { data, error } = await resend.emails.send({
        from: "Merlin AI <merlin-sat@resend.dev>",
        to: [email],
        subject: "Merlin AI Automation",
        html: `
            <p>Your task is done. You can access your sheet below:</p>
            <p>Sheet URL: ${sheetUrl}</p>`,
    });

    if (data) {
        console.log(data);
    }
    if (error) {
        console.log(error);
    }
}

async function sendWhatsappNotification(message: string, type: string) {    
    await axios.post('http://localhost:3000/api/whatsapp', { message, type });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { config } = req.body;

    console.log("notificationHandler config", config);

    try {
        // Run the middleware
        await runMiddleware(req, res, cors);
        if (config.type === "image-generation") {
            await sendEmailNotification("shahbazfoyerforteams@gmail.com", config.message);
        }
        await sendWhatsappNotification(config.message, config.type);

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error sending notification:', error);

        return res.status(500).json({
            error: 'Failed to send notification.',
            details: error,
        });
    }
}