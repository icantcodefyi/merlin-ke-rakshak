import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { webSearch } from './webSearch'

const titleSchema = z.object({
  mainTitle: z.string(),
  titles: z.array(
    z.object({
      id: z.number(),
      text: z.string(),
      outline: z.string()
    })
  )
})

export async function generateTitles(topic: string): Promise<z.infer<typeof titleSchema>> {
  const searchResults = await webSearch(topic);

  const prompt = `Generate a main title and exactly 5 section titles with corresponding outlines for an article about "${topic}". 
Use the following search results as context to ensure the titles and outlines are current and relevant:

${searchResults.map((result, index) => `
${index + 1}. ${result.title}
  ${result.snippet}
`).join('\n')}

Requirements:
1. Provide a main title that is comprehensive, concise, and less than 10 words.
2. Provide exactly 5 section titles with corresponding outlines.
3. Each section title must be less than 7 words and no more than 50 characters.
4. Use humanized, conversational language.
5. Write titles in sentence case (capitalize only the first word and proper nouns).
6. Ensure each title is unique and not repetitive.
7. Avoid AI-like or overly formal language.
8. Incorporate current information from the search results where appropriate.
9. For each section title, provide a brief outline (2-3 sentences) describing the key points to be covered in that section.
10. Ensure the outlines create a logical flow of information throughout the article.
11. Avoid redundancy between sections in the outlines.

Example style:
Main title: "The Future of Sustainable Energy: A Global Perspective"

Section titles:
- Title: "Renewable energy sources on the rise"
  Outline: Introduce the main renewable energy sources. Discuss recent growth trends. Highlight the most promising technologies.

- Title: "Challenges in transitioning to clean energy"
  Outline: Explore infrastructure limitations. Address intermittency issues. Discuss energy storage solutions.

Remember:
- The main title must be LESS THAN 10 WORDS.
- Each section title must be LESS THAN 7 WORDS and NO MORE THAN 50 CHARACTERS.
- Use SENTENCE CASE for titles: capitalize only the first word and proper nouns.
- Outlines should be CONCISE but INFORMATIVE.
- These requirements are crucial and must be followed precisely.`

  const result = await generateObject({
    model: openai('gpt-4o', { structuredOutputs: true }),
    schema: titleSchema,
    prompt,
  })

  // Ensure we have exactly 5 titles
  if (result.object.titles.length !== 5) {
    throw new Error('Generated titles do not meet the required count of 5');
  }

  // Post-process titles to ensure they meet our word count criteria
  const processedTitles = result.object.titles.map(title => ({
    ...title,
    text: title.text.split(' ').slice(0, 10).join(' ').trim()
  }));

  return { mainTitle: result.object.mainTitle, titles: processedTitles };
}

