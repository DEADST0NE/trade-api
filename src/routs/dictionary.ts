import express from 'express'
import passport from 'passport'

import dictionaryStages from '../controllers/dictionary/stages'
import dictionaryMeasures from '../controllers/dictionary/measures'

const router = express.Router()

router.get('/stages', passport.authenticate('jwt', {session: false}), dictionaryStages) //api/dictionary/stages
router.get('/measures', passport.authenticate('jwt', {session: false}), dictionaryMeasures) //api/dictionary/measures

export default router