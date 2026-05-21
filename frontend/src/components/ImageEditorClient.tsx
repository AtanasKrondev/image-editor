'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImageLibrary from '@/components/ImageLibrary';
import ImagePreview from '@/components/ImagePreview';
import type { Image } from '@/types';

export default function ImageEditorClient() {
  const [selected, setSelected] = useState<Image | null>(null);

  return (
    <>
      <ImageUploader />
      <ImageLibrary onSelect={setSelected} />
      <ImagePreview image={selected} onClose={() => setSelected(null)} />
    </>
  );
}
