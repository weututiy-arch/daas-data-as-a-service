import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI } from "@google/genai";
import { imageCache } from '../lib/image-cache';
import { buildFallbackArtDataUrl, type FallbackVariant } from '../lib/fallback-art';

interface DynamicImageProps {
  prompt: string;
  alt: string;
  className?: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  seed?: string; // Used for caching
  staticImageUrl?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackVariant?: FallbackVariant;
}

const DynamicImage = ({ 
  prompt, 
  alt, 
  className, 
  aspectRatio = "16:9",
  seed,
  staticImageUrl,
  fallbackTitle,
  fallbackSubtitle,
  fallbackVariant = "hero",
}: DynamicImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fallbackUrl = buildFallbackArtDataUrl({
    title: fallbackTitle || alt,
    subtitle: fallbackSubtitle,
    aspectRatio,
    seed: seed || alt,
    variant: fallbackVariant,
  });

  useEffect(() => {
    let isMounted = true;
    const generateImage = async () => {
      if (staticImageUrl) {
        if (isMounted) {
          setLoading(false);
          setError(false);
          setImageUrl(staticImageUrl);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(false);
      }

      const cacheKey = `gen_img_${seed || prompt.replace(/\s+/g, '_').toLowerCase()}`;
      
      try {
        const cached = imageCache.get(cacheKey);
        if (cached) {
          if (isMounted) {
            setImageUrl(cached);
            setLoading(false);
          }
          return;
        }

        // Add a small random delay to stagger requests and avoid hitting rate limits (429)
        // especially when multiple images are requested on page load
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));

        if (!isMounted) return;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
            },
          },
        });

        if (!isMounted) return;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64Data = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setImageUrl(base64Data);
            imageCache.set(cacheKey, base64Data);
            break;
          }
        }

        if (!response.candidates?.[0]?.content?.parts?.some(part => part.inlineData) && isMounted) {
          setError(true);
        }
      } catch (err) {
        // Handle 429 specifically if possible, or just log and show fallback
        if (err instanceof Error && err.message.includes('429')) {
          console.warn(`Rate limit exceeded for image: ${alt}. Using fallback.`);
        } else {
          console.error("Error generating image:", err);
        }
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    generateImage();
    return () => { isMounted = false; };
  }, [prompt, seed, aspectRatio, alt, staticImageUrl]);

  if (loading) {
    return (
      <div className={cn("w-full h-full bg-brand-card animate-pulse flex items-center justify-center", className)}>
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <img 
        src={fallbackUrl} 
        alt={alt} 
        className={cn("w-full h-full object-cover", className)} 
        referrerPolicy="no-referrer" 
      />
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={cn("w-full h-full object-cover", className)} 
      referrerPolicy="no-referrer" 
    />
  );
};

export default DynamicImage;
