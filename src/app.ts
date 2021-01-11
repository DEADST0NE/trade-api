import express from 'express' 
import passport from 'passport'
import bodyParser from 'body-parser'

import authRoutes from './routs/auth'
import applicationRoutes from './routs/application'
import company from './routs/company'
import dictionaryRoutes from './routs/dictionary'

import middlewarePassportJs from './middleware/passport'

const app = express()

// Вспомогательные модули
  app.use(require("morgan")("dev"))
  app.use(passport.initialize())
  middlewarePassportJs(passport)
  app.use(require('cors')())
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
// ======================

// Роуты
  app.use('/api/auth', authRoutes) 
  app.use('/api/application', applicationRoutes)
  app.use('/api/company', company)
  app.use('/api/dictionary', dictionaryRoutes) 
// =====

export default app