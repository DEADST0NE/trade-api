import express from 'express'
import passport from 'passport'

import getCategories from '../controllers/category/getCategories' 
import putCategory from '../controllers/category/putCategory'
import postCategory from '../controllers/category/postCategory'
import deleteCategory from '../controllers/category/deleteCategory'
import getClientCategoryCompany from '../controllers/category/getClientCategoryCompany'

const router = express.Router()

router.get('', passport.authenticate('jwt', {session: false}), getCategories) //api/categories/
router.put('', passport.authenticate('jwt', {session: false}), putCategory) //api/categories/
router.post('', passport.authenticate('jwt', {session: false}), postCategory) //api/categories/
router.delete('', passport.authenticate('jwt', {session: false}), deleteCategory) //api/categories/
router.get('/client', passport.authenticate('jwt', {session: false}), getClientCategoryCompany) //api/categories/client

export default router