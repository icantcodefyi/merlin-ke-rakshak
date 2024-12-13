import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { getSheetRawData } from '@/serverActions/sheetSA';

const bearerToken = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImJkMGFlMTRkMjhkMTY1NzhiMzFjOGJlNmM4ZmRlZDM0ZDVlMWExYzEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQW5pcnVkZGggRHViZ2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTFo2R3JIMk4wenVmZmU1ekRsZG4wM1ZZczkzTmhYWW5lbkIwV0RBNmw1ZDV5a2hqaUw9czk2LWMiLCJyb2xlIjoicGFpZCIsInBsYW5OYW1lIjoiTWVybGluIFBybyIsImFnZ3JlZ2F0b3IiOiJzdHJpcGUiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZm95ZXItd29yayIsImF1ZCI6ImZveWVyLXdvcmsiLCJhdXRoX3RpbWUiOjE3MzM0ODMxMjYsInVzZXJfaWQiOiJ2UzZmZjJZV014aFh6MkhKeUlsNHRpOWE3S3kyIiwic3ViIjoidlM2ZmYyWVdNeGhYejJISnlJbDR0aTlhN0t5MiIsImlhdCI6MTczNDEwNjI2OCwiZXhwIjoxNzM0MTA5ODY4LCJlbWFpbCI6ImFkdWJnZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExNzgwOTA1MDYxMzg0NzQwODk5NCJdLCJlbWFpbCI6WyJhZHViZ2VAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.VtW-c6hxMjETgGIfa3GHCQYc8YLLqVfg9Jrn6wlcR5iXaviqJcqva6ryCrDCNdZ0Mbt04Iy-gzy-uqhLIuyRr1ZyYaJKRFkG1PPHvqmj7UmXLCx89AVToykBcT7zRH23DsmuZo23JD6F9mJQwiAGsM8-wzaPrZAQntDEbRZrzS_EE1fovuxW_xJ2n5t3OYfI5ziJfiD-6GplwMN3fqRzlEDRV96bRVuaTBVemK3m5AHN8cD8ZQA_SGwNa1Rald1iwggqrlxgrQMcFqxMBH8H6YK5WqrbR4P6azqaXoBez-T13TBLVWrEnLa1Sg8VjB0DpHq8zi8R1n2FYiuieUS6dA"

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
    return response.data.data.sheetUrl;
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
        return { message: 'Workflow started' };
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