import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { deleteImage, getImage, getImagePreview, getImages, uploadImages } from '../controllers/imagesController.js'

export const imagesRouter = Router()

imagesRouter.get('/', getImages)
imagesRouter.get('/:id/preview', getImagePreview)
imagesRouter.get('/:id', getImage)
imagesRouter.delete('/:id', deleteImage)
imagesRouter.post('/upload', upload.array('images'), uploadImages)
