"use client";

import { VideoPlayer } from "./VideoPlayer";
import { FileViewer } from "./FileViewer";

interface LessonContentProps {
  contentType?: string;
  content?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileType?: string;
  title?: string;
  description?: string;
}

export function LessonContent({
  contentType = "text",
  content,
  videoUrl,
  fileUrl,
  fileType,
  title,
  description,
}: LessonContentProps) {
  return (
    <div className="space-y-6">
      {/* Video Content */}
      {(contentType === "video" || contentType === "mixed") && videoUrl && (
        <VideoPlayer
          videoUrl={videoUrl}
          title={title}
          description={description}
        />
      )}

      {/* File Content */}
      {(contentType === "file" || contentType === "mixed") && fileUrl && (
        <FileViewer
          fileUrl={fileUrl}
          fileName={title}
          fileType={fileType}
          description={description}
        />
      )}

      {/* Text/HTML Content */}
      {(contentType === "text" || contentType === "mixed") && content && (
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}

      {/* Fallback message */}
      {!content && !videoUrl && !fileUrl && (
        <div className="rounded-lg border border-dashed bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No content available for this lesson yet.
          </p>
        </div>
      )}
    </div>
  );
}
