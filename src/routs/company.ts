import express from 'express'
import passport from 'passport'

import getClientSearch from '../controllers/company/getClientSearch'
import getClients from '../controllers/company/getClients'
import postClient from '../controllers/company/postClient'
import deleteClient from '../controllers/company/deleteClient'

import postClientCategory from '../controllers/company/postClientCategory'
import getClientCategory from '../controllers/company/getClientCategory'
import deleteClientCategory from '../controllers/company/deleteClientCategory'
import putClientCategory from '../controllers/company/putClientCategory'

import getCompany from '../controllers/company/getCompany'

const router = express.Router()

router.get('/search/clients', passport.authenticate('jwt', {session: false}), getClientSearch) //api/company/search

router.get('/clients', passport.authenticate('jwt', {session: false}), getClients) //api/company/clients
router.post('/client', passport.authenticate('jwt', {session: false}), postClient) //api/company/client
router.delete('/client', passport.authenticate('jwt', {session: false}), deleteClient) //api/company/client

router.get('/', passport.authenticate('jwt', {session: false}), getCompany) //api/company

router.post('/client/category', passport.authenticate('jwt', {session: false}), postClientCategory) //api/company/client/category
router.get('/client/category', passport.authenticate('jwt', {session: false}), getClientCategory) //api/company/client/category
router.delete('/client/category', passport.authenticate('jwt', {session: false}), deleteClientCategory) //api/company/client/category
router.put('/client/category', passport.authenticate('jwt', {session: false}), putClientCategory) //api/company/client/category

export default router