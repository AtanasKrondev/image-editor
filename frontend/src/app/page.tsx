import ImageUploader from '@/components/ImageUploader'
import ImageLibrary from '@/components/ImageLibrary'

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Image Editor</h1>
      <ImageUploader />
      <ImageLibrary />
    </main>
  )
}
