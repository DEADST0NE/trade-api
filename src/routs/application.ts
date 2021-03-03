import express from 'express'
import passport from 'passport'

import getApplications from '../controllers/application/getApplications' 
import getApplicationDitail from '../controllers/application/getApplicationDitail'
import products from '../controllers/application/products'
import getPayments from '../controllers/application/getPayments'
import postStage from '../controllers/application/postStage'
import postPayment from '../controllers/application/postPayment'
import postApplications from '../controllers/application/postApplication'
import putPayment from '../controllers/application/putPayment'
import postClientApplication from '../controllers/application/postClientApplication'
//import getStages from '../controllers/application/getStages'

const router = express.Router()

router.get('/applications', passport.authenticate('jwt', {session: false}), getApplications) //api/application/applications
router.get('/ditail', passport.authenticate('jwt', {session: false}), getApplicationDitail) //api/application/ditail
router.post('/application', passport.authenticate('jwt', {session: false}), postApplications) //api/application/application
router.post('/client', passport.authenticate('jwt', {session: false}), postClientApplication) //api/application/client
router.get('/products', passport.authenticate('jwt', {session: false}), products) //api/application/products
router.get('/payments', passport.authenticate('jwt', {session: false}), getPayments) //api/application/payments

router.post('/stage', passport.authenticate('jwt', {session: false}), postStage) //api/application/stage
router.post('/payment', passport.authenticate('jwt', {session: false}), postPayment) //api/application/payment
router.put('/payment', passport.authenticate('jwt', {session: false}), putPayment)

//router.get('/stages', passport.authenticate('jwt', {session: false}), getStages) //api/application/stages

export default router