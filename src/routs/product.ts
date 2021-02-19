import express from 'express'
import passport from 'passport'

import getProducts from '../controllers/product/getProducts' 
import putProduct from '../controllers/product/putProduct'
import postProduct from '../controllers/product/postProduct'
import deleteProducts from '../controllers/product/deleteProduct'
import searchProduct from '../controllers/product/searchProduct'
import getClientProduct from '../controllers/product/getClientProduct'
import getClietnDitailProduct from '../controllers/product/getClietnDitailProduct'
import getClientDitailProductOther from '../controllers/product/getClientDitailProductOther'

const router = express.Router()

router.get('/', passport.authenticate('jwt', {session: false}), getProducts) //api/product/
router.put('/', passport.authenticate('jwt', {session: false}), putProduct) //api/product/
router.post('/', passport.authenticate('jwt', {session: false}), postProduct) //api/product/
router.delete('/', passport.authenticate('jwt', {session: false}), deleteProducts) //api/product/
router.get('/search', passport.authenticate('jwt', {session: false}), searchProduct) //api/product/search

router.get('/client', passport.authenticate('jwt', {session: false}), getClientProduct) //api/product/client
router.get('/client/ditail', passport.authenticate('jwt', {session: false}), getClietnDitailProduct) //api/product/client/ditail
router.get('/client/ditail/other', passport.authenticate('jwt', {session: false}), getClientDitailProductOther) //api/product/client/ditail/other

export default router