export async function fetchSocialMediaContent(
  url: string,
  platform: "instagram" | "tiktok"
): Promise<string> {
  try {
    const oembedUrl =
      platform === "instagram"
        ? `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&format=json`
        : `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as { title?: string };
    const title = data.title ?? "";

    return `${platform === "instagram" ? "Instagram" : "TikTok"} Post:\n${title}`;
  } catch {
    return `${platform} URL: ${url}. Inhalt konnte nicht abgerufen werden.`;
  }
}
