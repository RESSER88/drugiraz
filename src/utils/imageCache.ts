
// Image caching utilities for better performance
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 50; // Maximum number of cached images

  set(key: string, value: string) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

export const getCachedImage = (src: string): string | undefined => {
  return imageCache.get(src);
};

export const setCachedImage = (src: string, optimizedSrc: string) => {
  imageCache.set(src, optimizedSrc);
};

export const preloadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check cache first
    const cached = getCachedImage(src);
    if (cached) {
      resolve(cached);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setCachedImage(src, src);
      resolve(src);
    };
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};
