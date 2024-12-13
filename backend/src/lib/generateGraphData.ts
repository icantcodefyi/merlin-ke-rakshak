import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const graphDataSchema = z.object({
  type: z.enum(['pie', 'bar']),
  title: z.string(),
  data: z.array(z.object({
    label: z.string(),
    value: z.number().min(0)  // Changed from .positive() to .min(0)
  })),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional()
})

export async function generateGraphData(topic: string, context: string): Promise<z.infer<typeof graphDataSchema>> {
  console.log(`[GRAPH] Starting graph data generation for topic: "${topic}"`);

  const prompt = `Generate plottable data and graph specifications for a ${topic} based on the following context:

${context}

Requirements:
1. Choose either a pie chart or a bar chart, whichever is more appropriate for the data.
2. Provide a title for the graph that accurately describes the data being presented.
3. Generate structured, quantitative data that is either distribution-based or historical.
4. Ensure all numerical values are zero or positive.
5. For pie charts, provide 3-8 data points. For bar charts, provide 4-10 data points.
6. If generating historical data, ensure the labels represent a chronological sequence.
7. Provide appropriate axis labels for bar charts (x-axis and y-axis).

Output the data in the following JSON format:
{
  "type": "bar" or "pie",
  "title": "Graph title",
  "data": [
    { "label": "Category 1", "value": 100 },
    { "label": "Category 2", "value": 200 },
    ...
  ],
  "xAxisLabel": "X-axis label (for bar charts only)",
  "yAxisLabel": "Y-axis label (for bar charts only)"
}

Ensure that the data is accurate, relevant to the topic, and suitable for the chosen chart type. If you can't generate perfect data, provide the best approximation possible based on the given context.`

  console.log('[GRAPH] Sending request to generate graph data...');
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: graphDataSchema,
      prompt,
    })

    console.log('[GRAPH] Received graph data from AI model');
    console.log('[GRAPH] Generated graph data:', JSON.stringify(result.object, null, 2));

    // Guardrails and data salvaging
    console.log('[GRAPH] Applying guardrails and data salvaging...');
    let data = result.object.data
    if (data.length === 0) {
      console.warn('[GRAPH] No data points generated. Creating default "No Data" entry.');
      data = [{ label: "No Data", value: 100 }]
    }

    if (result.object.type === 'pie' && data.length > 8) {
      console.warn(`[GRAPH] Too many data points for pie chart (${data.length}). Trimming to 8.`);
      data = data.slice(0, 8)
    } else if (result.object.type === 'bar' && data.length > 10) {
      console.warn(`[GRAPH] Too many data points for bar chart (${data.length}). Trimming to 10.`);
      data = data.slice(0, 10)
    }

    const finalResult = {
      ...result.object,
      data,
      xAxisLabel: result.object.type === 'bar' ? (result.object.xAxisLabel || 'Category') : undefined,
      yAxisLabel: result.object.type === 'bar' ? (result.object.yAxisLabel || 'Value') : undefined
    };

    console.log('[GRAPH] Final graph data after salvaging:', JSON.stringify(finalResult, null, 2));
    return finalResult;
  } catch (error) {
    console.error('[GRAPH] Error during graph data generation:', error);
    throw error;
  }
}

