import { Request, Response } from 'express'

import { getToken, decodeToken } from '../../utils/token'

const refreshToken = (req: Request, res: Response) => { 
  const refreshToken :string = req.body.refreshToken;
  if(!!refreshToken){
    const user: any = decodeToken(refreshToken);
    if(user)
      return res.status(200).json({ ...getToken({ ...user.data }) });
    else
      return res.status(401).json({ message: 'Ошибка в создании токена доступа' });
  }
  return res.status(401).json({ message: 'Токен не указан' });
}

export default refreshToken;