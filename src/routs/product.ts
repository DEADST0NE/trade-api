import express from 'express'
import passport from 'passport'

import getProducts from '../controllers/product/getProducts' 
import putProduct from '../controllers/product/putProduct'
import postProduct from '../controllers/product/postProduct'
import deleteProducts from '../controllers/product/deleteProduct'
import searchProduct from '../controllers/product/searchProduct'

const router = express.Router()

router.get('/', passport.authenticate('jwt', {session: false}), getProducts) //api/product/
router.put('/', passport.authenticate('jwt', {session: false}), putProduct) //api/product/
router.post('/', passport.authenticate('jwt', {session: false}), postProduct) //api/product/
router.delete('/', passport.authenticate('jwt', {session: false}), deleteProducts) //api/product/
router.get('/search', passport.authenticate('jwt', {session: false}), searchProduct) //api/product/search

export default router