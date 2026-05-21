'use client';

import useSWR from 'swr';
import { fetchImages, getPreviewUrl, IMAGES_KEY } from '@/services/api';
import type { Image as ImageType } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageLibrary({
  onSelect,
}: {
  onSelect?: (image: ImageType) => void;
}) {
  const {
    data: images,
    error,
    isLoading,
  } = useSWR<ImageType[]>(IMAGES_KEY, fetchImages);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 mt-6 text-sm">
        Failed to load images: {error.message}
      </p>
    );
  }

  if (!images || images.length === 0) {
    return (
      <p className="text-gray-400 mt-6 text-center">
        No images yet. Upload some above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
      {images.map((img) => (
        <div
          key={img.id}
          className="rounded-lg border border-gray-200 overflow-hidden bg-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelect?.(img)}
        >
          <div className="aspect-square bg-gray-50 overflow-hidden">
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
            <p className="text-xs text-gray-400">
              {img.width}x{img.height} · {img.format.toUpperCase()} ·{' '}
              {formatBytes(img.size)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
