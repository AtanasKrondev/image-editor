import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { uploadImages } from '../controllers/imagesController.js'

export const imagesRouter = Router()

imagesRouter.post('/upload', upload.array('images'), uploadImages)
