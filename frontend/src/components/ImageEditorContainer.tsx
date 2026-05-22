'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetchImages, IMAGES_KEY } from '@/services/api';
import ImageLibrary from '@/components/ImageLibrary';
import ImagePreview from '@/components/ImagePreview';
import type { Image } from '@/types';

export default function ImageEditorContainer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewVersions, setPreviewVersions] = useState<Record<string, number>>({});
  const { data: images, isLoading, mutate } = useSWR<Image[]>(IMAGES_KEY, fetchImages);

  const displayedImage =
    images && images.length > 0
      ? (images.find((img) => img.id === selectedId) ?? images[0])
      : null;

  return (
    <div className="flex flex-col gap-1 h-full">
      <div className="h-[calc(100vh-120px)]">
        <ImagePreview
          key={displayedImage?.id ?? 'none'}
          image={displayedImage}
          isLoading={isLoading}
          onEdit={(imageId) => {
            mutate();
            setPreviewVersions((prev) => ({ ...prev, [imageId]: (prev[imageId] ?? 0) + 1 }));
          }}
        />
      </div>
      <div className="h-[100px]">
        <ImageLibrary onSelect={(img) => setSelectedId(img.id)} previewVersions={previewVersions} />
      </div>
    </div>
  );
}
