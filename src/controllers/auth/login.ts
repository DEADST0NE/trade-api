import { Request, Response } from 'express'
import prisma from '../../../prisma'

import { getToken } from '../../utils/token'
import { compare } from '../../utils/bcrypt'

const login = (req: Request, res: Response) => {
  if (!req.body.email) return res.status(400).json({ email: 'Почтовый адрес не задан' }); 
  try { 
    prisma.s_accounts.findUnique({
      where: {
        login: req.body.email,
      },
      include: {
        d_user: true,
        d_clients: true,
        s_role: true
      }
    }).then(async (condidate) => {
      if(condidate) {
        if(await compare(req.body.password, condidate.password)) {
          const user = condidate.d_user[0];
          const client = condidate.d_clients[0];
          const userData = user ? {
            id: user.id,
            name: user.user_name,
            email: user.email,
            job: user.job_pos_name,
            companyId: user.d_companies_id,
          } : {
            id: client.id,
            email: client.email,
            name: client.client_name,
            phone1: client.phone_number1,
            address: client.address,
          }
          return res.status(200).json({ ...getToken({
            ...userData,
            role: condidate.s_role.role_name
          }) });
        }
        return res.status(400).json({ password: 'Неверный пароль' });
      }
      else
        return res.status(400).json({ email: 'Текущий email не зарегистрирован' });
    })
  }
  catch (err){
    return res.status(500).json({ message: 'Ошибка подключения к базе данных' });
  }  
}

export default login;