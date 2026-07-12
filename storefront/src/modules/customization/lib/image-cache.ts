// Module-level cache of decoded images keyed by URL / data URL. Kept out of
// React/zustand state so re-renders don't reload images and the 3D texture and
// 2D canvas share the exact same decoded bitmap.

const cache = new Map<string, HTMLImageElement>()

export function getCachedImage(url: string): HTMLImageElement | undefined {
  return cache.get(url)
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  const existing = cache.get(url)
  if (existing) {
    return Promise.resolve(existing)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Harmless for same-origin / data URLs; enables clean canvas export when
    // the backend serves artwork with permissive CORS.
    img.crossOrigin = "anonymous"
    img.onload = () => {
      cache.set(url, img)
      resolve(img)
    }
    img.onerror = (e) => reject(e)
    img.src = url
  })
}
