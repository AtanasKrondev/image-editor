'use client';

import { useRef, useState, DragEvent } from 'react';
import { useSWRConfig } from 'swr';
import { uploadImages, IMAGES_KEY } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircleIcon, UploadIcon, XIcon } from 'lucide-react';

export default function ImageUploader({
  onComplete,
}: {
  onComplete?: () => void;
} = {}) {
  const { mutate } = useSWRConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function onSelectFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    setError(null);
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      await uploadImages(selectedFiles);
      mutate(IMAGES_KEY);
      setSelectedFiles([]);
      if (inputRef.current) inputRef.current.value = '';
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setSelectedFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    onSelectFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <Card
        className={`cursor-pointer transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-dashed hover:border-primary/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-10">
          <UploadIcon className="size-10 text-muted-foreground mb-2" />
          {selectedFiles.length > 0 && (
            <p className="text-primary font-medium mb-2">
              {selectedFiles.length} file(s) selected
            </p>
          )}
          <p className="text-muted-foreground">
            Drag &amp; drop images here or click to browse
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            JPEG, PNG, WebP — up to 50 MB each
          </p>
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => onSelectFiles(e.target.files)}
      />

      {selectedFiles.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative w-[100px] h-[100px] rounded-lg border border-border overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="absolute top-1 right-1 size-6"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              size="default"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              onClick={handleClear}
              disabled={uploading}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
