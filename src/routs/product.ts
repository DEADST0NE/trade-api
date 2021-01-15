import express from 'express'
import passport from 'passport'

import getProducts from '../controllers/product/getProducts'
import putProducts from '../controllers/product/putProducts'

const router = express.Router()

router.get('/', passport.authenticate('jwt', {session: false}), getProducts) //api/product/product
router.put('/', passport.authenticate('jwt', {session: false}), putProducts) //api/product/product

export default router