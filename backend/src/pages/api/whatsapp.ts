import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, LocalAuth } from 'whatsapp-web.js';
const qrcode = require('qrcode-terminal');

// Initialize the client with LocalAuth strategy
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one" // Unique identifier for this client
    }),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

let isClientReady = false;

client.on('qr', (qr: string) => {
    // QR code will only be generated for the first time
    console.log('QR CODE:', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Web Client is ready!');
    isClientReady = true;
});

client.on('authenticated', () => {
    console.log('Client is authenticated!');
});

// Initialize the client immediately
client.initialize();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Wait for client to be ready if it's not
        if (!isClientReady) {
            await new Promise<void>((resolve) => {
                const checkReady = setInterval(() => {
                    if (isClientReady) {
                        clearInterval(checkReady);
                        resolve();
                    }
                }, 1000);
            });
        }

        const { message: messageBody, type } = req.body;

        const number = '917488636141';
        const chatId = `${number}@c.us`;
        let message = ""
        if (type === "image-generation") {
            message = `Hi your task is done. Here is the link: ${messageBody}`;
        } else if (type === "crypto-analyzer") {
            message = messageBody
        }
        await client.sendMessage(chatId, message);

        return res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Failed to send message:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message', error });
    }
}