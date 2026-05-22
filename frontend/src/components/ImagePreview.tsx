'use client';

import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { getPreviewUrl, editImage } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw } from 'lucide-react';
import type { Image } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagePreview({
  image,
  isLoading,
  onEdit,
}: {
  image: Image | null;
  isLoading?: boolean;
  onEdit?: (imageId: string) => void;
}) {
  const [cacheKey, setCacheKey] = useState(0);
  const [pendingAngle, setPendingAngle] = useState(0);
  const [waitingForReload, setWaitingForReload] = useState(false);

  const { trigger, isMutating } = useSWRMutation(
    image?.id ?? null,
    async (id: string, { arg }: { arg: { angle: number } }) => {
      await editImage(id, 'rotate', { angle: arg.angle });
    }
  );

  async function apply() {
    if (!image) return;
    const normalizedAngle = ((pendingAngle % 360) + 360) % 360;
    await trigger({ angle: normalizedAngle });
    setWaitingForReload(true);
    setCacheKey((k) => k + 1);
    onEdit?.(image.id);
  }

  const hasPendingChanges = pendingAngle % 360 !== 0;

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
              src={getPreviewUrl(image.id, cacheKey)}
              alt={image.original_filename}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `rotate(${pendingAngle}deg)`,
                transition: 'transform 0.2s',
              }}
              onLoad={() => {
                if (waitingForReload) {
                  setPendingAngle(0);
                  setWaitingForReload(false);
                }
              }}
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingAngle((a) => a - 90)}
            >
              <RotateCcw data-icon="inline-start" />
              Rotate Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingAngle((a) => a + 90)}
            >
              <RotateCw data-icon="inline-start" />
              Rotate Right
            </Button>
            <Button
              size="sm"
              onClick={apply}
              disabled={!hasPendingChanges || isMutating || waitingForReload}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
