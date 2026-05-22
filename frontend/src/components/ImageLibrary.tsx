'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetchImages, getPreviewUrl, IMAGES_KEY } from '@/services/api';
import ImageUploader from '@/components/ImageUploader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircleIcon, UploadIcon } from 'lucide-react';
import ImageThumbnail from '@/components/ImageThumbnail';
import type { Image } from '@/types';

export default function ImageLibrary({
  onSelect,
  previewVersions,
}: {
  onSelect?: (image: Image) => void;
  previewVersions?: Record<string, number>;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const {
    data: images,
    error,
    isLoading,
  } = useSWR<Image[]>(IMAGES_KEY, fetchImages);

  return (
    <>
      <div>
        {isLoading && (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pr-8 pb-4">
              <div
                className="w-[100px] h-[100px] rounded-lg border border-dashed border-border overflow-hidden bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors flex-shrink-0"
                onClick={() => setUploadOpen(true)}
              >
                <UploadIcon className="size-6 text-muted-foreground" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-[100px] h-[100px] rounded-lg flex-shrink-0"
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertDescription>
              Failed to load images: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (!images || images.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            No images yet. Click above to upload.
          </p>
        )}

        {!isLoading && images && images.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pr-8 pb-4">
              <div
                className="w-[100px] h-[100px] rounded-lg border border-dashed border-border overflow-hidden bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors flex-shrink-0"
                onClick={() => setUploadOpen(true)}
              >
                <UploadIcon className="size-6 text-muted-foreground" />
              </div>
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onSelect?.(img)}
                  className="w-[100px] h-[100px] rounded-lg border border-border overflow-hidden bg-muted hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0"
                >
                  <ImageThumbnail id={img.id} alt={img.original_filename} version={previewVersions?.[img.id]} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="!w-[calc(100vw-10px)] !sm:w-[calc(100vw-80px)] !h-[calc(100vh-10px)] !sm:h-[calc(100vh-40px)] !max-w-none flex flex-col p-0">
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Upload Images</DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ImageUploader onComplete={() => setUploadOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
