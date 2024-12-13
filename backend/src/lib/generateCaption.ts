import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function generateCaption(
  input: string,
  mediaType: 'gen-image' | 'web-image' | 'graph' | 'table',
  searchResults?: string
): Promise<string> {
  let prompt = '';

  switch (mediaType) {
    case 'gen-image':
      prompt = `Create a brief, engaging caption for an AI-generated image based on this prompt: "${input}". The caption should be descriptive and relate to the image content.`;
      break;
    case 'web-image':
      prompt = `Create a brief, informative caption for a web image found using this search query: "${input}". Use the following search results for context if relevant: ${searchResults}. The caption should provide context and relate to the image content.`;
      break;
    case 'graph':
      prompt = `Create a concise caption that summarizes the key information presented in this graph data: ${input}. The caption should highlight the main trend or insight from the data.`;
      break;
    case 'table':
      prompt = `Create a brief caption that describes the content and purpose of this table: ${input}. The caption should give readers a quick understanding of what information the table presents.`;
      break;
  }

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
  });

  return result.text.trim();
}

