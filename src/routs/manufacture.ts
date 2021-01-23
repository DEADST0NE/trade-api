import express from 'express'
import passport from 'passport'

import getManufacturers from '../controllers/manufacture/getManufacturers' 
import putManufacturers from '../controllers/manufacture/putManufacturers'
import postManufacturers from '../controllers/manufacture/postManufacturers'
import deleteManufacturers from '../controllers/manufacture/deleteManufacturers'
import searchManufacturers from '../controllers/manufacture/searchManufacturers'

const router = express.Router()

router.get('', passport.authenticate('jwt', {session: false}), getManufacturers) //api/manufacture/
router.put('', passport.authenticate('jwt', {session: false}), putManufacturers) //api/manufacture/
router.post('', passport.authenticate('jwt', {session: false}), postManufacturers) //api/manufacture/
router.delete('', passport.authenticate('jwt', {session: false}), deleteManufacturers) //api/manufacture/
router.get('/search', passport.authenticate('jwt', {session: false}), searchManufacturers) //api/manufacture/search
export default router