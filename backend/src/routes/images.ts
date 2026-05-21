import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { getImage, getImagePreview, getImages, uploadImages } from '../controllers/imagesController.js'

export const imagesRouter = Router()

imagesRouter.get('/', getImages)
imagesRouter.get('/:id/preview', getImagePreview)
imagesRouter.get('/:id', getImage)
imagesRouter.post('/upload', upload.array('images'), uploadImages)
