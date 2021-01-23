import express from 'express'
import passport from 'passport'

import getImgProduct from '../controllers/img/productImg' 

const router = express.Router()

router.get('/product', getImgProduct) //api/img/product

export default router