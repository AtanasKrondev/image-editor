import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { deleteImage, downloadImage, editImage, getImage, getImageHistory, getImagePreview, getImages, undoLastEdit, uploadImages } from '../controllers/imagesController.js'
import { validate } from '../middleware/validate.js'
import { editSchema } from '../schemas/editSchemas.js'

export const imagesRouter = Router()

imagesRouter.get('/', getImages)
imagesRouter.get('/:id/download', downloadImage)
imagesRouter.get('/:id/preview', getImagePreview)
imagesRouter.get('/:id/history', getImageHistory)
imagesRouter.get('/:id', getImage)
imagesRouter.post('/:id/edit', validate(editSchema), editImage)
imagesRouter.delete('/:id/history/last', undoLastEdit)
imagesRouter.delete('/:id', deleteImage)
imagesRouter.post('/upload', upload.array('images'), uploadImages)
