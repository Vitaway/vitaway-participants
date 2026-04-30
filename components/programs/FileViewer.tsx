"use client";

import { useState } from "react";
import {
  Download,
  File,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileViewerProps {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  description?: string;
}

export function FileViewer({
  fileUrl,
  fileName,
  fileType,
  description,
}: FileViewerProps) {
  const [error, setError] = useState<string | null>(null);

  // Helper function to get file extension
  const getFileExtension = (url: string): string => {
    try {
      const pathname = new URL(url, "http://localhost").pathname;
      const ext = pathname.split(".").pop()?.toLowerCase() || "file";
      return ext;
    } catch {
      return "file";
    }
  };

  // Helper function to get file icon based on type
  const getFileIcon = (ext: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const docExtensions = ["pdf", "doc", "docx", "txt", "rtf"];
    const spreadsheetExtensions = ["xls", "xlsx", "csv"];
    const videoExtensions = ["mp4", "webm", "mov", "avi"];

    if (imageExtensions.includes(ext)) return "image";
    if (docExtensions.includes(ext)) return "document";
    if (spreadsheetExtensions.includes(ext)) return "spreadsheet";
    if (videoExtensions.includes(ext)) return "video";
    return "file";
  };

  // Helper function to check if file can be previewed
  const canPreviewFile = (ext: string): boolean => {
    const previewableExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "txt",
    ];
    return previewableExtensions.includes(ext);
  };

  const ext = fileType || getFileExtension(fileUrl);
  const fileKind = getFileIcon(ext);
  const previewable = canPreviewFile(ext);
  const displayName = fileName || `File.${ext}`;

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              Error loading file
            </p>
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              {fileKind === "document" ? (
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              ) : fileKind === "image" ? (
                <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <File className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                {displayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs uppercase">
                  {ext}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {fileKind}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {previewable && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </a>
              </Button>
            )}
            <Button variant="default" size="sm" asChild>
              <a
                href={fileUrl}
                download={displayName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </div>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
            {description}
          </p>
        )}

        {/* Preview for images and PDFs */}
        {previewable && ext !== "txt" && (
          <div className="rounded-lg border bg-slate-50 dark:bg-slate-900 p-4 max-h-96 overflow-auto mt-4">
            {fileKind === "image" ? (
              <img
                src={fileUrl}
                alt={displayName}
                className="max-w-full h-auto rounded-lg"
                onError={() => setError("Failed to load image preview")}
              />
            ) : fileKind === "document" && ext === "pdf" ? (
              <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    PDF preview not available in browser
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Click "Preview" or "Download" to view the PDF
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Text file preview */}
        {ext === "txt" && (
          <div className="rounded-lg border bg-slate-50 dark:bg-slate-900 p-4 max-h-96 overflow-auto mt-4">
            <iframe
              src={fileUrl}
              className="w-full h-64 border-0 rounded-lg bg-white dark:bg-slate-800"
              title={displayName}
              onError={() => setError("Failed to load text preview")}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
