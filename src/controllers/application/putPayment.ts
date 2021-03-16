import { Request, Response } from 'express'
import prisma from '../../../prisma'

const putPayment = (req: Request, res: Response) => {
  const applicationId = req.body.applicationId;
  const paymentId = req.body.paymentId;
  const userId = req.body.userId;
  const sumPay = req.body.sumPay;
  if (applicationId && userId && sumPay && paymentId) {

    prisma.d_clients_application.findMany({
      where: {
        id: applicationId, 
      },
      include: { 
        d_clients_application_pay: {
          select: {
            id: true,
            sum_pay: true
          }
        },
        d_clients_application_products: {
          select: {
            count_product: true,
            total: true 
          }
        }
      },
    }).then(data => {  
      const sumPayAll = data[0].d_clients_application_pay.filter( (a) => a.id != paymentId ).reduce((a,b) => (a + b.id !=paymentId ? Number(b.sum_pay) : 0),0);
      const sunProductTotal = data[0]?.d_clients_application_products.reduce((a,b) => (a + (Number(b.total) * b.count_product)),0); 
      if(Number((sunProductTotal - sumPayAll).toFixed(2)) >= sumPay) { 
        prisma.d_clients_application_pay.update({
          where: {
            id: paymentId
          },
          data: {
            sum_pay: Number(sumPay),
            pay_date: new Date(),
            d_user: {
              connect: {
                id: userId
              }
            } 
          }
        }).then(data => { 
          return res.status(200).send(data);
        }).catch(err => {
            return res.status(500).send({ message: err.message || "Error" });
        });
      }else 
        return res.status(400).send({ message: "Оплата превышает остаток" });
    }).catch(err => {
      return res.status(500).send({ message: err.message || "Ошибка подключения к базе" });
    }); 
  }
  else
    return res.status(400).send({ message: "Обязательные поля не заполнены" });
}

export default putPayment