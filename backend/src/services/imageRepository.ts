import { prisma } from '../config/database.js'
import type { Prisma, Image } from '../generated/prisma/client.js'

export type CreateImageData = Omit<
  Prisma.ImageCreateInput,
  'id' | 'created_at' | 'updated_at' | 'editHistory'
>

export async function createImage(data: CreateImageData): Promise<Image> {
  return prisma.image.create({ data })
}

export async function getAllImages(): Promise<Image[]> {
  return prisma.image.findMany({ orderBy: { created_at: 'desc' } })
}

export async function getImageById(id: string): Promise<Image | null> {
  return prisma.image.findUnique({ where: { id } })
}

export async function deleteImageById(id: string): Promise<void> {
  await prisma.image.delete({ where: { id } })
}
