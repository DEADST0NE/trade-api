import express from 'express'
import passport from 'passport'

import dictionaryStages from '../controllers/dictionary/stages'

const router = express.Router()

router.get('/stages', passport.authenticate('jwt', {session: false}), dictionaryStages) //api/dictionary/stages

export default router