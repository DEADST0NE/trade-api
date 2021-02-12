import express from 'express' 
import passport from 'passport'
import bodyParser from 'body-parser'

import authRoutes from './routs/auth'
import applicationRoutes from './routs/application'
import company from './routs/company'
import dictionaryRoutes from './routs/dictionary'
import productRoutes from './routs/product'
import imgRoutes from './routs/img'
import categories from './routs/categories'
import manufacture from './routs/manufacture'

import middlewarePassportJs from './middleware/passport'

const app = express()

// Вспомогательные модули
  app.use(require("morgan")("dev"))
  app.use(passport.initialize())
  middlewarePassportJs(passport)
  app.use(require('cors')())
  app.use(bodyParser.json({
    limit: '50mb'
  }));
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }));
// ======================

// Роуты
  app.use('/api/auth', authRoutes) 
  app.use('/api/application', applicationRoutes)
  app.use('/api/company', company)
  app.use('/api/dictionary', dictionaryRoutes)
  app.use('/api/product', productRoutes) 
  app.use('/api/img', imgRoutes)
  app.use('/api/categories', categories) 
  app.use('/api/manufacture', manufacture)
// ===== 

export default app