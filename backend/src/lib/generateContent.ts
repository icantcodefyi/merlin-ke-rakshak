import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { webSearch } from './webSearch'
import { generateImage } from './generateImage'
import { searchImage } from './searchImage'
import { generateGraphData } from './generateGraphData'
import { generateCaption } from './generateCaption'

const sectionSchema = z.object({
  content: z.string(),
  mediaTag: z.string(),
  mediaContent: z.string().nullable(),
  mediaCaption: z.string().nullable()
})

export async function generateSectionContent(
  title: string,
  outline: string,
  sectionNumber: number,
  overallTopic: string,
  previousSectionContent?: string
): Promise<z.infer<typeof sectionSchema>> {
  console.log(`Generating content for section ${sectionNumber}: ${title}`);

  const searchResults = await webSearch(title);
  console.log('Web search results:', searchResults);

  const mediaType = ['web-image', 'graph', 'table', 'gen-image'][(sectionNumber - 1) % 4];
  console.log('Media type for this section:', mediaType);

  const prompt = `Generate a comprehensive section of content for an article with the title: "${title}". This section is part of a larger article about "${overallTopic}".

Context for this section:

1. Overall Topic: "${overallTopic}"
   - This is the main theme of the entire article. Ensure that your content aligns with and contributes to this overarching subject.
   - Make relevant connections between this section's specific topic and the broader context of the article.

2. Section Title: "${title}"
   - This title defines the main focus of this specific section. Your content should directly address and elaborate on this title.
   - Select information, examples, and arguments that best support and explain the main idea expressed in this title.

3. Section Outline:
${outline}
   - Use this outline as a roadmap for structuring your content. Cover all the main points listed here.
   - Ensure a logical flow of ideas within the section, following the sequence suggested by the outline.
   - Expand on each point in the outline, providing detailed explanations, examples, or data as appropriate.

4. Previous Section Content:
${previousSectionContent ? `"${previousSectionContent}"` : "This is the first section of the article."}
   - If this isn't the first section, use the content of the previous section to create a smooth transition.
   - Build upon or contrast with ideas presented in the previous section when relevant.
   - Avoid repeating information already covered, unless necessary for context or emphasis.
   - Ensure your content logically follows from and connects with the previous section, maintaining a coherent narrative throughout the article.

Use the following search results as additional context to ensure the content is accurate, up-to-date, and relevant:

${searchResults.map((result, index) => `
${index + 1}. ${result.title}
  ${result.snippet}
`).join('\n')}

Requirements:
1. Write engaging, informative content that directly addresses the section title and follows the provided outline.
2. Maintain relevance to the overall topic while focusing on this section's specific subject.
3. Use markdown formatting for headings, lists, and emphasis.
4. Include exactly one ${mediaType} tag in the content where it's most relevant.
5. For the ${mediaType} tag, provide a specific, detailed, and contextually relevant prompt or query.
6. Ensure all factual information is accurate and based on the search results or reliable sources.
7. Do not hallucinate or make up any data. If specific information is not available, acknowledge this limitation.
8. Use a natural, conversational tone while maintaining professionalism.
9. Aim for about 3-4 paragraphs of content, with each paragraph being 4-6 sentences long.
10. Include relevant statistics, expert opinions, or case studies if available in the search results.

Media tag format and guidelines:
- Web image: <web-image>Provide a detailed description for finding an image that is directly related to "${title}" and "${overallTopic}". Focus on specific individuals, events, or concepts mentioned in the title or topic. Avoid generic or loosely related images.</web-image>
- Graph: <graph>Provide a clear, concise description of the data to be visualized in a graph. Focus on quantitative, distribution-based, or historical data that is directly relevant to the topic. Specify whether a pie chart or bar chart would be more appropriate. Include the topic and any necessary context for generating accurate data.</graph>
- Table: <table>Provide a detailed description of quantitative, historical, or factual data to search for and display. Focus on accurate, verifiable information from reliable web sources. Include specific numerical data such as currency values, population figures, percentages, years, or other relevant statistics. Specify the columns, number of rows (aim for at least 3-5 rows), and any sorting criteria.</table>
- Generated image: <gen-image>Create a vivid, detailed description for DALL-E to generate an image that complements the content. Include style, composition, colors, and specific elements to be featured.</gen-image>

IMPORTANT: Make sure to include the ${mediaType} tag directly in the content, not in a separate field. The tag should be placed where it's most relevant to the surrounding text.

Remember, accuracy and relevance are crucial. Only include information that can be verified from the search results or is common knowledge. The media tag should be seamlessly integrated into the content, providing valuable visual support to the written information.`

  console.log('Generating content with GPT-4...');
  const result = await generateObject({
    model: openai('gpt-4o', { structuredOutputs: true }),
    schema: sectionSchema,
    prompt,
  })

  console.log('Generated content:', result.object);

  let mediaContent: string | null = null;
  let mediaCaption: string | null = null;

  if (mediaType === 'gen-image') {
    console.log('Extracting image prompt from media tag...');
    const imagePromptMatch = result.object.content.match(/<gen-image>(.*?)<\/gen-image>/s);
    if (imagePromptMatch) {
      const imagePrompt = imagePromptMatch[1].trim();
      console.log('Image prompt extracted:', imagePrompt);
      mediaContent = await generateImage(imagePrompt);
      console.log('Image generation result:', mediaContent ? 'Success' : 'Failed');

      mediaCaption = await generateCaption(imagePrompt, 'gen-image');
    } else {
      console.error('Failed to extract image prompt from content');
      console.log('Content:', result.object.content);
    }
  } else if (mediaType === 'web-image') {
    console.log('Processing web-image media type');
    const imagePromptMatch = result.object.content.match(/<web-image>(.*?)<\/web-image>/s);
    if (imagePromptMatch) {
      const imagePrompt = imagePromptMatch[1].trim();
      console.log('Web image prompt extracted:', imagePrompt);
      try {
        const imageUrl = await searchImage(imagePrompt);
        if (imageUrl) {
          console.log('Successfully found web image:', imageUrl);
          result.object.content = result.object.content.replace(/<web-image>.*?<\/web-image>/s, `<web-image>${imageUrl}</web-image>`);

          mediaCaption = await generateCaption(imagePrompt, 'web-image', searchResults);
        } else {
          console.warn('No suitable web image found for prompt:', imagePrompt);
        }
      } catch (error) {
        console.error('Error during web image search:', error);
      }
    } else {
      console.error('Failed to extract web image prompt from content');
      console.log('Content:', result.object.content);
    }
  } else if (mediaType === 'graph') {
    console.log('[GRAPH] Processing graph media type');
    const graphPromptMatch = result.object.content.match(/<graph>(.*?)<\/graph>/s);
    if (graphPromptMatch) {
      const graphPrompt = graphPromptMatch[1].trim();
      console.log('[GRAPH] Graph prompt extracted:', graphPrompt);
      try {
        const graphData = await generateGraphData(title, graphPrompt);
        if (graphData) {
          console.log('[GRAPH] Successfully generated graph data:', graphData);
          mediaContent = JSON.stringify(graphData);
          result.object.content = result.object.content.replace(/<graph>.*?<\/graph>/s, `<graph>${mediaContent}</graph>`);

          mediaCaption = await generateCaption(graphData, 'graph');
        } else {
          console.warn('[GRAPH] Failed to generate graph data for prompt:', graphPrompt);
        }
      } catch (error) {
        console.error('[GRAPH] Error during graph data generation:', error);
      }
    } else {
      console.error('[GRAPH] Failed to extract graph prompt from content');
      console.log('[GRAPH] Content:', result.object.content);
    }
  } else if (mediaType === 'table') {
    const tableMatch = result.object.content.match(/<table>(.*?)<\/table>/s);
    if (tableMatch) {
      const tableContent = tableMatch[1].trim();

      mediaCaption = await generateCaption(tableContent, 'table');
    }
  }

  return {
    ...result.object,
    mediaContent,
    mediaCaption
  }
}

