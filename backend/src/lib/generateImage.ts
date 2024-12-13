import { experimental_generateImage as generateImages } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateImage(prompt: string): Promise<string | null> {
  console.log('Starting image generation process...');
  console.log('Image generation prompt:', prompt);

  if (!prompt) {
    console.error('Empty prompt provided for image generation');
    return null;
  }

  try {
	const { image } = await generateImages({
	   model: openai.image('dall-e-3'),
	   prompt:prompt,
	   n: 1, 
	   size: '1024x1024',
	});

   // console.log('Image generation API response:', JSON.stringify(images, null, 2));

    if (image) {
      console.log('Image generated successfully. URL available.');
      return image.base64;
    } else {
      console.error('No image data found in the response');
      return null;
    }
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

