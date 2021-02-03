import express from 'express'
import passport from 'passport'

import getApplications from '../controllers/application/getApplications' 
import products from '../controllers/application/products'
import getPayments from '../controllers/application/getPayments'
import postStage from '../controllers/application/postStage'
import postPayment from '../controllers/application/postPayment'
import postApplications from '../controllers/application/postApplication'
import putPayment from '../controllers/application/putPayment'
//import getStages from '../controllers/application/getStages'

const router = express.Router()

router.get('/applications', passport.authenticate('jwt', {session: false}), getApplications) //api/application/applications
router.post('/application', passport.authenticate('jwt', {session: false}), postApplications) //api/application/application
router.get('/products', passport.authenticate('jwt', {session: false}), products) //api/application/products
router.get('/payments', passport.authenticate('jwt', {session: false}), getPayments) //api/application/payments

router.post('/stage', passport.authenticate('jwt', {session: false}), postStage) //api/application/stage
router.post('/payment', passport.authenticate('jwt', {session: false}), postPayment) //api/application/payment
router.put('/payment', passport.authenticate('jwt', {session: false}), putPayment)

//router.get('/stages', passport.authenticate('jwt', {session: false}), getStages) //api/application/stages

export default router