const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

export async function fetchYouTubeContent(url: string): Promise<string> {
  const videoId = extractVideoId(url);

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);

    if (!res.ok) throw new Error("oEmbed fehlgeschlagen");

    const data = await res.json() as { title: string; author_name: string };
    let description = "";

    // Beschreibung aus der Watch-Seite extrahieren
    try {
      const watchRes = await fetch(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
          headers: { "User-Agent": BROWSER_UA },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (watchRes.ok) {
        const html = await watchRes.text();
        const descMatch = html.match(/"description":\{"simpleText":"([^"]+)"/);
        if (descMatch) {
          description = descMatch[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"');
        }
      }
    } catch {
      // Beschreibung nicht verfügbar – trotzdem fortfahren
    }

    return `Titel: ${data.title}\nKanal: ${data.author_name}${
      description ? `\n\nBeschreibung:\n${description}` : ""
    }`;
  } catch {
    return `YouTube Video: ${url}`;
  }
}

function extractVideoId(url: string): string {
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}
