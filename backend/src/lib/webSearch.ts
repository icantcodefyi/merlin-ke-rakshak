export async function webSearch(query: string) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      num: 5
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }

  const data = await response.json();
  return data.organic.map((result: any) => ({
    title: result.title,
    snippet: result.snippet,
    link: result.link
  }));
}

