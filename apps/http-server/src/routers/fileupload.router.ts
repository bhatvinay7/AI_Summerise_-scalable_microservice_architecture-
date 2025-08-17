import upload from '../../../http-server/src/Multer/multer'
import express,{Router} from 'express'
import uploadFile from '../../../http-server/src/controller/uploadFile'
const router:Router=express.Router()
router.post('/upload',upload.single('file'),uploadFile)


export default router