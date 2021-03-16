import express from 'express'

import getImgProduct from '../controllers/img/productImg' 
import getImgCompany from '../controllers/img/companyImg'

const router = express.Router()

router.get('/product', getImgProduct) //api/img/product
router.get('/company', getImgCompany) //api/img/company

export default router