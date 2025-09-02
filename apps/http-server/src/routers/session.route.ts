import getSession from '../controller/getUserSessions'
import getSessionData from '../controller/getSessionData'
import express,{Router} from 'express'
const router:Router=express.Router()


router.get('/session',getSession)
router.get('/getSessionData/:sessionId',getSessionData)
export default router