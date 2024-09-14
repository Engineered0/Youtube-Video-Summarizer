import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    try {
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Summarize the following transcript:\n\n${transcript}\n\nSummary:`,
        max_tokens: 150,
        temperature: 0.7,
      });

      const summary = response.data.choices[0].text?.trim();
      res.status(200).json({ summary });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate summary" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
