"use client";

import { useState } from "react";
import { Play, AlertCircle, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  description?: string;
  provider?: "youtube" | "vimeo" | "direct" | "auto";
}

export function VideoPlayer({
  videoUrl,
  title,
  description,
  provider = "auto",
}: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);

  // Helper function to detect video provider and extract embed URL
  const getEmbedUrl = (url: string): { embedUrl: string; type: string } => {
    try {
      // YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("youtube.com")) {
          videoId = new URL(url).searchParams.get("v") || "";
        } else {
          videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
        }
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
          type: "youtube",
        };
      }

      // Vimeo
      if (url.includes("vimeo.com")) {
        const videoId = url.split("vimeo.com/")[1]?.split("?")[0]?.split("/")[0];
        return {
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
          type: "vimeo",
        };
      }

      // Direct video file (mp4, webm, etc.)
      if (
        url.includes(".mp4") ||
        url.includes(".webm") ||
        url.includes(".ogg") ||
        url.includes(".mov")
      ) {
        return { embedUrl: url, type: "direct" };
      }

      // If no provider is detected, try as direct URL
      return { embedUrl: url, type: "direct" };
    } catch (err) {
      setError("Invalid video URL format");
      return { embedUrl: "", type: "unknown" };
    }
  };

  const { embedUrl, type } = getEmbedUrl(videoUrl);

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              Error loading video
            </p>
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {title || "Video Content"}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Open in new tab
            </a>
          </Button>
        </div>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        <div className="relative w-full bg-black rounded-lg overflow-hidden">
          {type === "direct" ? (
            <video
              src={embedUrl}
              controls
              className="w-full aspect-video"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full aspect-video border-0 rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || "Video Player"}
            />
          )}
        </div>
        <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="capitalize">{type} video</span>
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline truncate dark:text-primary-400"
            >
              {videoUrl.length > 50
                ? `${videoUrl.substring(0, 50)}...`
                : videoUrl}
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
