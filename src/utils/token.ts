import jwt from 'jsonwebtoken'
import tokenConfig from '../config/_tokenConfig'

const getToken = (data: unknown) => (
  {
    token: jwt.sign({ data }, tokenConfig.privateKey, tokenConfig.options),
    refreshToken: jwt.sign({ data }, tokenConfig.privateKeyRefreshToken, tokenConfig.options),
  }
);

const decodeToken = ( token: string ) => jwt.decode(token);

export { getToken, decodeToken };