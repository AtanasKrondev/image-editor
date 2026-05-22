'use client';

import { getPreviewUrl } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {!isLoading && !image && (
          <div className="flex items-center justify-center bg-muted rounded-lg aspect-video">
            <p className="text-muted-foreground text-center">
              No image selected. Upload or select an image from the carousel below.
            </p>
          </div>
        )}

        {!isLoading && image && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-muted">
              <img
                src={getPreviewUrl(image.id)}
                alt={image.original_filename}
                className="w-full h-auto"
              />
            </div>
            <div>
              <h3 className="font-medium truncate" title={image.original_filename}>
                {image.original_filename}
              </h3>
              <p className="text-sm text-muted-foreground">
                {image.width}x{image.height} · {image.format.toUpperCase()} ·{' '}
                {formatBytes(image.size)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
