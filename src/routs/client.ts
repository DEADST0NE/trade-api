import express from 'express'
import passport from 'passport'

import getAccountInfo from '../controllers/client/getAccountInfo'

const router = express.Router()

router.get('/accountInfo', passport.authenticate('jwt', {session: false}), getAccountInfo) //api/client/accountInfo

export default router