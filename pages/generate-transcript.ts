import type { NextApiRequest, NextApiResponse } from "next";
import { getTranscript } from "youtube-transcript-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const videoId = new URL(url).searchParams.get("v");
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const transcript = await getTranscript(videoId);
      const fullText = transcript.map((item) => item.text).join(" ");

      res.status(200).json({ transcript: fullText });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate transcript" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
