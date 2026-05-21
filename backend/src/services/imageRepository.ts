import { prisma } from '../config/database.js'
import type { Prisma, Image } from '../generated/prisma/client.js'

export type CreateImageData = Omit<
  Prisma.ImageCreateInput,
  'id' | 'created_at' | 'updated_at' | 'editHistory'
>

export async function createImage(data: CreateImageData): Promise<Image> {
  return prisma.image.create({ data })
}
