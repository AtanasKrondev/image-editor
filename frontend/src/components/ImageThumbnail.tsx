'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { getPreviewUrl } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchPreview(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load preview');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export default function ImageThumbnail({
  id,
  alt,
  version,
}: {
  id: string;
  alt: string;
  version?: number;
}) {
  const { data: blobUrl } = useSWR(
    ['preview', id, version ?? 0],
    ([, imageId, v]) => fetchPreview(getPreviewUrl(imageId, v === 0 ? undefined : (v as number)))
  );

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (!blobUrl) return <Skeleton className="w-full h-full" />;

  return (
    <img src={blobUrl} alt={alt} className="w-full h-full object-cover" />
  );
}
