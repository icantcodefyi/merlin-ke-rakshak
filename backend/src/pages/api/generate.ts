import type { NextApiRequest, NextApiResponse } from "next";
import { generateTitles } from "@/lib/generateTitles";
import { generateSectionContent } from "@/lib/generateContent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "No prompt provided" });
      return;
    }

    if (!process.env.SERPER_API_KEY || !process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: "Required API keys not configured" });
      return;
    }

    console.log("Generating titles...");
    const titlesResult = await generateTitles(prompt);
    console.log("Generated titles:", titlesResult);

    // Send titles
    res.write(
      JSON.stringify({
        mainTitle: titlesResult.mainTitle,
        titles: titlesResult.titles,
        topic: prompt,
      }) + "\n",
    );

    console.log("Generating sections...");
    let previousSectionContent = "";
    for (const title of titlesResult.titles) {
      const sectionContent = await generateSectionContent(
        title.text,
        title.outline,
        title.id,
        prompt,
        previousSectionContent,
      );
      console.log(`Generated section for title: ${title.text}`);

      res.write(
        JSON.stringify({
          sections: [sectionContent],
        }) + "\n",
      );

      previousSectionContent = sectionContent.content;
    }

    console.log("Article generation complete");
    res.end();
  } catch (error: any) {
    console.error("Error in API route:", error);
    res
      .status(500)
      .json({ error: error.message || "An unexpected error occurred" });
  }
}
