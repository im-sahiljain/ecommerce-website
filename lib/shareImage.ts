const SHARE_TRANSFORM = "c_fill,g_auto,w_1200,h_630,f_jpg,q_auto,fl_progressive";

/** Small landscape JPEG for link previews. The product page still uses the original file. */
export function shareImageUrl(url: string | undefined | null) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url || undefined;
  }
  if (url.includes(`/${SHARE_TRANSFORM}/`)) return url;
  return url.replace("/upload/", `/upload/${SHARE_TRANSFORM}/`);
}
