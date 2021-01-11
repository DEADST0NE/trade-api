import express from 'express'
import login from '../controllers/auth/login'
import refreshToken from '../controllers/auth/refreshToken'

const router = express.Router()

router.post('/login', login) //api/auth/login
router.post('/refreshToken', refreshToken) //api/auth/refreshToken

export default router;