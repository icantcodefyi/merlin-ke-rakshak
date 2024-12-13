import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { getSheetRawData } from '@/serverActions/sheetSA';

const bearerToken = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImJkMGFlMTRkMjhkMTY1NzhiMzFjOGJlNmM4ZmRlZDM0ZDVlMWExYzEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiU2hhaGJheiBBaG1hZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLTU83ei1sSWstYTZHX1dWQTdFamd6TTdPSjZtdjlHN3VSUl9aSHBzcms2NThadGc9czk2LWMiLCJzdHJpcGVSb2xlIjoiYjJiX2FkbWluIiwicm9sZSI6Im93bmVyIiwicGxhbk5hbWUiOiJNZXJsaW4gVGVhbXMiLCJhZ2dyZWdhdG9yIjoic3RyaXBlIiwidGVhbUlkIjoiMTFlYmY5MjUtZmE2Yi00NjBmLTk5OGQtYjMzYzhmZmNhY2FlIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2ZveWVyLXdvcmsiLCJhdWQiOiJmb3llci13b3JrIiwiYXV0aF90aW1lIjoxNzMzNTYyMDQ2LCJ1c2VyX2lkIjoidzdkdlNkcFNYNlJzdk02cTdIbHpHTHZoWTNLMiIsInN1YiI6Inc3ZHZTZHBTWDZSc3ZNNnE3SGx6R0x2aFkzSzIiLCJpYXQiOjE3MzQwOTU3MDEsImV4cCI6MTczNDA5OTMwMSwiZW1haWwiOiJzaGFoYmF6QGZveWVyLndvcmsiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExODI2ODQwNjg5MDgwMDA3ODgxOSJdLCJlbWFpbCI6WyJzaGFoYmF6QGZveWVyLndvcmsiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.aK3ELF06aBhWnrcv1zRxTcFVZIYUvnBNRSc7BNjtwo9H-QgB6bcUrsxnWYh5DCrVz6qLx9YltAtRndGk5qlKtPxVW9S0PPfPOkbr3JMy_Vmd88eg7Sp73ws_E5E-1h9VGN2Dm-13hCqLb3VATBFh80at2G_X1XOQV68MvH-DJYfyG2XQL1kWqByOIbqSzrXvryIaEeGIUNjnczAsXIG8YiTcDBNDTQ8D1aqP-TB5R6Zqw8T0WxbF2sp5zQACuAn0AdkdwZlOESe0vDxjKCFa0mTG3IyzonFYf4CaaaHlKEjRvpwV6UstywXR9m9E2kVBiSQ8pfevc25O8xx_8Au6Lg"

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

async function triggerImageGeneration(sheetData: any, prompt: string, columns: string[]) {
    const response = await axios.post("http://localhost:8080/v1/superAutomationTools/image-generate-sat", {
        config: {
            prompt,
            columns,
            data: sheetData
        }
    }, {
        headers: { 'Authorization': bearerToken }
    })
    return response.data.sheetUrl;
}

async function triggerNotifications(sheetUrl: string) {
    await axios.post("http://localhost:3000/api/notificationHandler", {
        config: {
            email: "shahbazfoyerforteams@gmail.com",
            sheetUrl: sheetUrl
        }
    });
}

async function getContextFromLLM(content: any, contentType: string, prompt: string) {
    const response = await axios.post("http://localhost:8080/v1/superAutomationTools/context-generate-sat", {
        config: {
            content,
            contentType,
            prompt
        }
    }, {
        headers: { 'Authorization': bearerToken }
    })
    return response.data.context;
}

// Simulated services for node types
const services = {
    start: async (node: any) => {
        console.log(`Executing start node: ${node.id}`);
        return { message: 'Workflow started' }; triggerImageGeneration
    },
    'google-integration': async (node: any) => {
        const response = await getSheetRawData(node.data.config.link)
        // Simulate fetching data from Google Sheets
        return { data: response, message: 'Google Sheets integration executed' };
    },
    'llm': async (node: any, content: any, contentType: string, prompt: string) => {
        const context = await getContextFromLLM(content, contentType, prompt);
        // Simulate image generation
        return { data: context, message: 'Image generation completed' };
    },
    'image-generation': async (node: any, sheetData: any, prompt: string, columns: string[]) => {
        console.log("Image generation service called with:", {
            nodeId: node.id,
            hasSheetData: !!sheetData,
            prompt,
            columns
        });
        try {
            const sheetUrl = await triggerImageGeneration(sheetData, prompt, columns);
            console.log("Received sheet URL from image generation:", sheetUrl);
            return { data: sheetUrl, message: 'Image generation completed' };
        } catch (error) {
            console.error("Error in image generation service:", error);
            throw error;
        }
    },
    'text-message': async (node: any, sheetUrl: string) => {
        await triggerNotifications(sheetUrl);
        // Simulate sending a text message
        return { status: 'sent', message: 'Text message sent' };
    },
    end: async (node: any) => {
        console.log(`Executing End node: ${node.id}`);
        return { message: 'Workflow completed' };
    }
};

// Recursive function to process nodes
async function processNode(nodeId: string, nodes: any, results = {}) {
    const node = nodes.find((n: any) => n.id === nodeId);
    if (!node) {
        throw new Error(`Node with ID ${nodeId} not found`);
    }

    // Execute the node's service
    const service = services[node.type];
    if (!service) {
        throw new Error(`No service defined for node type: ${node.type}`);
    }

    console.log(`Processing node: ${node.id}`);
    let result;
    if (node.type === "llm") {
        const previousNode = nodes.find((n: any) => n.id === node.connections.incoming[0] && n.type === "google-integration");
        const content = results[previousNode.id].data;
        const contentType = node.data.contentType;
        const prompt = node.data.input;
        result = await service(node, content, contentType, prompt);
    }
    else if (node.type === "image-generation") {
        const previousNode = nodes.find((n: any) => n.id === node.connections.incoming[0] && n.type === "google-integration");
        const columns = previousNode.data.config.columns;
        const content = results[previousNode.id].data;
        const prompt = node.data.config.prompt;
        result = await service(node, content, prompt, columns);
    }
    else if (node.type === "text-message") {
        const previousNode = nodes.find((n: any) => n.id === node.connections.incoming[0] && n.type === "image-generation");
        const sheetUrl = results[previousNode.id].data;
        result = await service(node, sheetUrl);
    }
    else {
        result = await service(node);
    }
    console.log("result", node.type, result);
    results[node.id] = result;

    // If no outgoing connections, return results
    if (!node.connections.outgoing || node.connections.outgoing.length === 0) {
        return results;
    }

    // Process outgoing nodes recursresultsively
    for (const outgoingNodeId of node.connections.outgoing) {
        await processNode(outgoingNodeId, nodes, results);
    }

    return results;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run the middleware
    await runMiddleware(req, res, cors);

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { config } = req.body;

    if (!config || !Array.isArray(config)) {
        return res.status(400).json({ error: 'Invalid nodes array' });
    }

    console.log("HERE", config);

    try {
        // Find the start node
        const startNode = config.find((node: any) => node.type === 'start');
        if (!startNode) {
            return res.status(400).json({ error: 'Start node not found' });
        }

        // Execute workflow starting from the start node
        const results = await processNode(startNode.id, config);
        console.log("results", results);
        return res.status(200).json({ status: 'success', results });
    } catch (error) {
        console.error('Error sending notification:', error);

        return res.status(500).json({
            error: 'Failed to send notification.',
            details: error,
        });
    }
}