export async function searchImage(query: string): Promise<string | null> {
  console.log(`Starting image search for query: "${query}"`);
  const response = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      num: 1
    })
  });
  console.log('Sending request to Serper API for image search');

  if (!response.ok) {
    throw new Error('Failed to fetch image search results');
  }

  const data = await response.json();
  console.log('Received response from Serper API');
  if (data.images && data.images.length > 0) {
    console.log(`Found image URL: ${data.images[0].imageUrl}`);
    return data.images[0].imageUrl;
  }

  console.log('No suitable image found');
  return null;
}

