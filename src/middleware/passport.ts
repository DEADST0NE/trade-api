import { Strategy, ExtractJwt } from 'passport-jwt'
import tokenConfig from '../config/_tokenConfig'
const { PrismaClient } = require('@prisma/client')
import { PassportStatic } from 'passport'

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: tokenConfig.privateKey
}

const prisma = new PrismaClient()

const middlewarePassportJs = ( passport: PassportStatic ) => { 
  passport.use(
    new Strategy(options, (payload, done) => {
      prisma.s_accounts.findUnique({
        where: { 
          login: payload.data.email
        },
      }).then((data: any) => {
        return done(null, data);
      }).catch(() => {
        return done({ 
          message: 'Текущий токен не действиделен или не является токеном данного проекта' 
        }, false);
      }) 
    })
  )
}

export default middlewarePassportJs;