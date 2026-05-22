'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetchImages, editImage, deleteImage, IMAGES_KEY } from '@/services/api';
import ImageLibrary from '@/components/ImageLibrary';
import ImagePreview, { type ImagePreviewHandle } from '@/components/ImagePreview';
import ToolPanel from '@/components/ToolPanel';
import EditHistory from '@/components/EditHistory';
import { useEditHistory } from '@/hooks/useEditHistory';
import type { Image, PendingEdit } from '@/types';

function toApiArgs(edit: NonNullable<PendingEdit>) {
  switch (edit.tool) {
    case 'rotate':  return { action: 'rotate',  parameters: { angle: edit.angle } };
    case 'flip':    return { action: 'flip',    parameters: { direction: edit.direction } };
    case 'blur':    return { action: 'blur',    parameters: { sigma: edit.sigma } };
    case 'sharpen': return { action: 'sharpen', parameters: { sigma: edit.sigma } };
    case 'resize':  return { action: 'resize',  parameters: { width: edit.width, height: edit.height } };
    case 'crop':    return { action: 'crop',    parameters: { x: edit.x, y: edit.y, width: edit.width, height: edit.height } };
  }
}

export default function ImageEditorContainer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewVersions, setPreviewVersions] = useState<Record<string, number>>({});
  const [pendingEdit, setPendingEdit] = useState<PendingEdit>(null);
  const imagePreviewRef = useRef<ImagePreviewHandle>(null);
  const { data: images, isLoading, mutate } = useSWR<Image[]>(IMAGES_KEY, fetchImages);

  const displayedImage =
    images && images.length > 0
      ? (images.find((img) => img.id === selectedId) ?? images[0])
      : null;

  useEffect(() => {
    setPendingEdit(null);
  }, [displayedImage?.id]);

  const bumpPreview = (id: string) => {
    setPreviewVersions((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const {
    history,
    redoStack,
    canUndo,
    canRedo,
    isUndoing,
    isRedoing,
    undo,
    redo,
    clearRedo,
    refetch: refetchHistory,
  } = useEditHistory(
    displayedImage?.id ?? null,
    () => { if (displayedImage) bumpPreview(displayedImage.id); }
  );

  const { trigger, isMutating } = useSWRMutation(
    displayedImage?.id ?? null,
    async (id: string, { arg }: { arg: { action: string; parameters: Record<string, unknown> } }) => {
      await editImage(id, arg.action, arg.parameters);
    }
  );

  async function handleApply(imageId: string, resolved: PendingEdit) {
    if (!resolved) return;
    const { action, parameters } = toApiArgs(resolved);
    await trigger({ action, parameters });
    clearRedo();
    mutate();
    refetchHistory();
    bumpPreview(imageId);
    setPendingEdit(null);
  }

  async function handleDelete() {
    if (!displayedImage) return;
    await deleteImage(displayedImage.id);
    setSelectedId(null);
    mutate();
  }

  async function handleUndo() {
    await undo();
  }

  async function handleRedo() {
    await redo();
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) void handleUndo();
      }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedo) void handleRedo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  const hasPendingChanges = (() => {
    if (!pendingEdit) return false;
    if (pendingEdit.tool === 'rotate') return pendingEdit.angle % 360 !== 0;
    if (pendingEdit.tool === 'blur') return pendingEdit.sigma > 0;
    if (pendingEdit.tool === 'sharpen') return pendingEdit.sigma > 0;
    if (pendingEdit.tool === 'resize') return pendingEdit.width > 0 && pendingEdit.height > 0;
    return true;
  })();

  return (
    <div className="flex flex-col gap-1 h-full">
      <div className="flex-1 min-h-0">
        <ImagePreview
          ref={imagePreviewRef}
          key={displayedImage?.id ?? 'none'}
          image={displayedImage}
          isLoading={isLoading}
          pendingEdit={pendingEdit}
          isMutating={isMutating}
          version={previewVersions[displayedImage?.id ?? ''] ?? 0}
          onApply={handleApply}
        />
      </div>
      <div>
        <ToolPanel
          image={displayedImage}
          pendingEdit={pendingEdit}
          isMutating={isMutating}
          hasPendingChanges={hasPendingChanges}
          onApply={() => void imagePreviewRef.current?.handleApply()}
          onDelete={() => void handleDelete()}
          onChange={setPendingEdit}
        />
      </div>
      <div>
        <EditHistory
          history={history}
          redoStack={redoStack}
          canUndo={canUndo}
          canRedo={canRedo}
          isUndoing={isUndoing}
          isRedoing={isRedoing}
          onUndo={() => void handleUndo()}
          onRedo={() => void handleRedo()}
        />
      </div>
      <div className="h-[100px]">
        <ImageLibrary onSelect={(img) => setSelectedId(img.id)} previewVersions={previewVersions} />
      </div>
    </div>
  );
}
