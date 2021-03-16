import { Request, Response } from 'express'
import prisma from '../../../prisma' 

const paidStatus = (array: any) => {
  let payTotal = array.reduce((sumG:number, item: any ) => (sumG + item.d_clients_application_pay?.reduce((a:any, b:any) => a + Number((b.sum_pay || 0)), 0)), 0);
  let paidTotal = array.reduce((sumG:number, item: any ) => (sumG + item.d_clients_application_products?.reduce((a:any, b:any) => a + Number((b.total || 0)), 0)), 0);
  if(paidTotal - payTotal <= 0) return 0;
  else return (payTotal - paidTotal * -1);
} 

const getAccountInfo = (req: Request, res: Response) => {
  const accountId = req.query.accountId as string;
  if (!accountId) return res.status(400).json({ message: 'id account не задан' }); 
  try { 
    prisma.s_accounts.findUnique({
      where: {
        id: accountId,
      },
      select: {
        id: true, 
        d_clients: {
          select: {
            id: true,
            client_name: true,
            email: true,
            password: true,
            phone_number1: true,
            address: true,
            d_clients_application: {
              select: {
                d_clients_application_pay: true,
                d_clients_application_products: {
                  select: { 
                    total: true,
                  }
                }
              }
            }
          }
        },
        s_role: true,
      }
    }).then(data => {
      const client = data?.d_clients[0];
      const requestData = {
        debt: paidStatus(client?.d_clients_application) || 0,
        applicationLength: client?.d_clients_application.length || 0,
      };
      return res.status(200).json(requestData);
    })
  }
  catch (err){
    return res.status(500).json({ message: 'Ошибка подключения к базе данных' });
  }  
}

export default getAccountInfo;