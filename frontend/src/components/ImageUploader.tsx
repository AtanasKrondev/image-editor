'use client'

import { useRef, useState, DragEvent } from 'react'
import { useSWRConfig } from 'swr'
import { uploadImages, IMAGES_KEY } from '@/services/api'

export default function ImageUploader() {
  const { mutate } = useSWRConfig()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function onSelectFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setSelectedFiles(prev => [...prev, ...Array.from(files)])
    setError(null)
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return
    setUploading(true)
    setError(null)
    try {
      await uploadImages(selectedFiles)
      mutate(IMAGES_KEY)
      setSelectedFiles([])
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleClear() {
    setSelectedFiles([])
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    onSelectFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {selectedFiles.length > 0 && (
          <p className="text-blue-600 font-medium mb-2">{selectedFiles.length} file(s) selected</p>
        )}
        <p className="text-gray-500">Drag &amp; drop images here or click to browse</p>
        <p className="text-sm text-gray-400 mt-1">JPEG, PNG, WebP — up to 50 MB each</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => onSelectFiles(e.target.files)}
      />
      {selectedFiles.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
                <div className="p-2">
                  <p className="text-xs font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={handleClear}
              disabled={uploading}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-700 rounded-lg font-medium"
            >
              Clear
            </button>
          </div>
        </>
      )}
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  )
}
