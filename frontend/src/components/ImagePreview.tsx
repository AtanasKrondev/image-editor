'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getPreviewUrl } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Image, PendingEdit } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildPreviewStyle(edit: PendingEdit): React.CSSProperties {
  if (!edit) return {};
  if (edit.tool === 'rotate') {
    return {
      transform: `rotate(${edit.angle}deg)`,
      transition: 'transform 0.2s',
    };
  }
  if (edit.tool === 'flip') {
    const scale = edit.direction === 'horizontal' ? 'scaleX(-1)' : 'scaleY(-1)';
    return { transform: scale, transition: 'transform 0.15s' };
  }
  if (edit.tool === 'blur') {
    return { filter: `blur(${edit.sigma}px)`, transition: 'filter 0.1s' };
  }
  if (edit.tool === 'sharpen') {
    const c = (1 + edit.sigma * 0.2).toFixed(2);
    const s = (1 + edit.sigma * 0.1).toFixed(2);
    return {
      filter: `contrast(${c}) saturate(${s})`,
      transition: 'filter 0.1s',
    };
  }
  return {};
}

export type ImagePreviewHandle = { handleApply: () => Promise<void> };

const ImagePreview = forwardRef<
  ImagePreviewHandle,
  {
    image: Image | null;
    isLoading?: boolean;
    pendingEdit: PendingEdit;
    isMutating?: boolean;
    version?: number;
    onApply?: (imageId: string, resolved: PendingEdit) => void;
  }
>(function ImagePreview(
  { image, isLoading, pendingEdit, isMutating, version = 0, onApply },
  ref,
) {
  const [cacheKey, setCacheKey] = useState(version);
  const [waitingForReload, setWaitingForReload] = useState(false);

  const [prevVersion, setPrevVersion] = useState(version);
  if (prevVersion !== version) {
    setPrevVersion(version);
    setCacheKey((k) => k + 1);
  }
  const [cropRect, setCropRect] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  });
  const imgRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({ handleApply }));

  const isCropMode = pendingEdit?.tool === 'crop';

  async function handleApply() {
    if (!image || !pendingEdit || isMutating) return;

    let resolved: PendingEdit = pendingEdit;
    if (pendingEdit.tool === 'crop' && imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      resolved = {
        tool: 'crop',
        unit: '%',
        x: Math.round((cropRect.x / 100) * naturalWidth),
        y: Math.round((cropRect.y / 100) * naturalHeight),
        width: Math.round((cropRect.width / 100) * naturalWidth),
        height: Math.round((cropRect.height / 100) * naturalHeight),
      };
    }

    setWaitingForReload(true);
    onApply?.(image.id, resolved);
  }

  const imgEl = (
    <img
      ref={imgRef}
      src={getPreviewUrl(image?.id ?? '', cacheKey)}
      alt={image?.original_filename ?? ''}
      className="max-w-full max-h-full object-contain"
      style={buildPreviewStyle(isCropMode ? null : pendingEdit)}
      onLoad={() => {
        if (waitingForReload) setWaitingForReload(false);
      }}
    />
  );

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
        <div className="h-full flex flex-col justify-between gap-2">
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

          <div className="flex justify-center items-center bg-muted flex-1 min-h-0 overflow-hidden">
            {isCropMode ? (
              <ReactCrop
                crop={cropRect}
                onChange={(_, pct) => setCropRect(pct)}
              >
                {imgEl}
              </ReactCrop>
            ) : (
              imgEl
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ImagePreview;
