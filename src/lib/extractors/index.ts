import { fetchYouTubeContent } from "./youtube";
import { fetchSocialMediaContent } from "./social-media";
import { fetchWebPage } from "./url-fetcher";

export async function fetchUrlContent(url: string): Promise<string> {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new Error(`Ungültige URL: ${url}`);
  }

  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    return fetchYouTubeContent(url);
  }
  if (hostname.includes("instagram.com")) {
    return fetchSocialMediaContent(url, "instagram");
  }
  if (hostname.includes("tiktok.com")) {
    return fetchSocialMediaContent(url, "tiktok");
  }
  return fetchWebPage(url);
}
