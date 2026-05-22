'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetchImages, getPreviewUrl, IMAGES_KEY } from '@/services/api';
import ImageUploader from '@/components/ImageUploader';
import ImagePreview from '@/components/ImagePreview';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import type { Image } from '@/types';

export default function ImageEditorClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data: images,
    error,
    isLoading,
  } = useSWR<Image[]>(IMAGES_KEY, fetchImages);

  const displayedImage =
    images && images.length > 0
      ? images.find((img) => img.id === selectedId) ?? images[0]
      : null;

  return (
    <div className="space-y-6">
      <ImageUploader />

      <ImagePreview image={displayedImage} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Gallery</h2>

        {isLoading && (
          <Carousel className="w-full">
            <CarouselContent className="gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarouselItem
                  key={i}
                  className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div className="rounded-lg border border-border overflow-hidden bg-background h-full flex flex-col">
                    <Skeleton className="aspect-square" />
                    <div className="p-2 flex flex-col gap-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
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
            No images yet. Upload some above.
          </p>
        )}

        {!isLoading && images && images.length > 0 && (
          <Carousel className="w-full">
            <CarouselContent className="gap-4">
              {images.map((img) => (
                <CarouselItem
                  key={img.id}
                  className={`basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 cursor-pointer transition-opacity ${
                    selectedId === img.id
                      ? 'opacity-100'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedId(img.id)}
                >
                  <div
                    className="rounded-lg border-2 overflow-hidden bg-background h-full flex flex-col"
                    style={{
                      borderColor:
                        selectedId === img.id
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--border))',
                    }}
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={getPreviewUrl(img.id)}
                        alt={img.original_filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p
                        className="text-xs font-medium truncate"
                        title={img.original_filename}
                      >
                        {img.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {img.width}x{img.height}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 4 && (
              <>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </>
            )}
          </Carousel>
        )}
      </div>
    </div>
  );
}
