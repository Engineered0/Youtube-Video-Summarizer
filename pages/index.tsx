import { useState } from "react";
import Head from "next/head";
import { Loader2, Youtube } from "lucide-react";

// Define the Button component inline
const Button = ({ isLoading, children, ...props }) => (
  <button
    {...props}
    className="w-full bg-sky-500 hover:bg-sky-600 text-white p-2 rounded"
    disabled={isLoading}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    ) : (
      children
    )}
  </button>
);

// Define the Input component inline
const Input = ({ ...props }) => (
  <input
    {...props}
    className="border-sky-200 focus:border-sky-400 focus:ring-sky-400 p-2 rounded w-full"
  />
);

// Define the Card component inline
const Card = ({ children }) => (
  <div className="w-full max-w-2xl bg-white shadow-lg">{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="bg-sky-100 rounded-t-lg p-4">{children}</div>
);

const CardContent = ({ children }) => (
  <div className="mt-6 p-4">{children}</div>
);

const CardFooter = ({ children }) => (
  <div className="bg-sky-50 rounded-b-lg p-4">{children}</div>
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const transcriptRes = await fetch("/api/generate-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const transcriptData = await transcriptRes.json();

      if (transcriptData.error) {
        throw new Error(transcriptData.error);
      }

      const summaryRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptData.transcript }),
      });
      const summaryData = await summaryRes.json();

      if (summaryData.error) {
        throw new Error(summaryData.error);
      }

      setSummary(summaryData.summary);
    } catch (error) {
      console.error("Error:", error);
      setSummary("An error occurred while processing the video.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <Head>
        <title>YouTube Summarizer</title>
        <meta
          name="description"
          content="Get quick summaries of YouTube videos"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-sky-800 flex items-center gap-2">
            <Youtube className="w-6 h-6" />
            YouTube Summarizer
          </h1>
          <p className="text-sky-600">Get quick summaries of YouTube videos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="youtube-url"
                className="text-sm font-medium text-sky-800"
              >
                YouTube Video URL
              </label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" isLoading={isLoading}>
              Generate Summary
            </Button>
          </form>
        </CardContent>
        {summary && (
          <CardFooter>
            <div className="w-full">
              <h3 className="text-lg font-semibold text-sky-800 mb-2">
                Summary
              </h3>
              <p className="text-sky-700 whitespace-pre-wrap">{summary}</p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
