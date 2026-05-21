import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { getImagePreview, getImages, uploadImages } from '../controllers/imagesController.js'

export const imagesRouter = Router()

imagesRouter.get('/', getImages)
imagesRouter.get('/:id/preview', getImagePreview)
imagesRouter.post('/upload', upload.array('images'), uploadImages)
