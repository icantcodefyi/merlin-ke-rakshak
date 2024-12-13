import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { auth, clerkClient } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authenticated user's ID using Clerk
    const { userId } = await auth();

    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        needsAuth: true 
      });
    }

    // Get the OAuth access token for Google from Clerk
    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(userId, 'oauth_google');
    
    if (!tokens || tokens.length === 0) {
      return res.status(401).json({ 
        error: 'No Google OAuth token found',
        needsAuth: true 
      });
    }

    const accessToken = tokens[0].token;

    // Create OAuth2 client with the token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Use Drive API instead of Slides API (to avoid verification requirement)
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Create a new presentation using Drive API
    const file = await drive.files.create({
      requestBody: {
        name: 'New Presentation',
        mimeType: 'application/vnd.google-apps.presentation',
      },
    });

    const presentationId = file.data.id;
    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

    return res.status(200).json({ 
      success: true,
      presentationUrl,
      presentationId
    });

  } catch (error) {
    console.error('Error creating presentation:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create presentation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}