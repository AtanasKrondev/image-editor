'use client';

import { getPreviewUrl } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Image } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagePreview({
  image,
  isLoading,
}: {
  image: Image | null;
  isLoading?: boolean;
}) {
  return (
    <div className="h-full">
      {isLoading && <Skeleton className="w-full aspect-video rounded-lg" />}

      {!isLoading && !image && (
        <div className="flex items-center justify-center bg-muted rounded-lg aspect-video">
          <p className="text-muted-foreground text-center">
            No image selected. Upload or select an image from the library below.
          </p>
        </div>
      )}

      {!isLoading && image && (
        <div className="h-full flex flex-col justify-between">
          <div className="flex justify-center gap-2 items-center">
            <h3
              className="font-medium truncate min-w-0"
              title={image.original_filename}
            >
              {image.original_filename}
            </h3>
            <p className="text-sm text-muted-foreground flex-shrink-0">
              {image.width}x{image.height} · {image.format.toUpperCase()} ·{' '}
              {formatBytes(image.size)}
            </p>
          </div>
          <div className="flex justify-center items-center bg-muted aspect-video overflow-hidden">
            <img
              src={getPreviewUrl(image.id)}
              alt={image.original_filename}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div>edit controls</div>
        </div>
      )}
    </div>
  );
}
