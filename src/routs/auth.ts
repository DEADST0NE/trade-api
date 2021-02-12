import express from 'express'
import login from '../controllers/auth/login'
import refreshToken from '../controllers/auth/refreshToken'
import registration from '../controllers/auth/registration'

const router = express.Router()

router.post('/login', login) //api/auth/login
router.post('/refreshToken', refreshToken) //api/auth/refreshToken
router.post('/registration', registration) //api/auth/registration

export default router;