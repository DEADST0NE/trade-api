import { Request, Response } from 'express'
import prisma from '../../../prisma'

import { getToken } from '../../utils/token'
import { compare } from '../../utils/bcrypt'

const paidStatus = (array: any) => {
  let payTotal = array.reduce((sumG:number, item: any ) => (sumG + item.d_clients_application_pay?.reduce((a:any, b:any) => a + Number((b.sum_pay || 0)), 0)), 0);
  let paidTotal = array.reduce((sumG:number, item: any ) => (sumG + item.d_clients_application_products?.reduce((a:any, b:any) => a + Number((b.total || 0)), 0)), 0);
  if(paidTotal - payTotal <= 0) return 0;
  else return (payTotal - paidTotal * -1);
} 

const login = (req: Request, res: Response) => {
  if (!req.body.email) return res.status(400).json({ email: 'Почтовый адрес не задан' }); 
  try { 
    prisma.s_accounts.findUnique({
      where: {
        login: req.body.email,
      },
      select: {
        id: true,
        d_user: {
          select: {
            id: true,
            email: true,
            password: true,
            d_companies_id: true,
            user_name: true,
            job_pos_name: true,
          }
        },
        d_clients: {
          select: {
            id: true,
            client_name: true,
            email: true,
            password: true,
            phone_number1: true,
            address: true
          }
        },
        s_role: true,
      }
    }).then(async (condidate) => {
      if(condidate) {
        if(await compare(req.body.password, condidate?.d_user[0]?.password || condidate?.d_clients[0]?.password)) {
          const user = condidate.d_user[0];
          const client = condidate.d_clients[0];
          const userData = user ? {
            id: user.id,
            accountId: condidate.id,
            name: user.user_name,
            email: user.email,
            job: user.job_pos_name,
            companyId: user.d_companies_id,
          } : {
            id: client.id,
            accountId: condidate.id,
            email: client.email,
            name: client.client_name,
            phone1: client.phone_number1,
            address: client.address
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