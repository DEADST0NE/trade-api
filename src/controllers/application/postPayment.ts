import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

const postPayment = (req: Request, res: Response) => {
  const applicationId = req.body.applicationId;
  const userId = req.body.userId;
  const sumPay = req.body.sumPay;
  if (applicationId && userId && sumPay) {

    prisma.d_clients_application.findMany({
      where: {
        id: applicationId
      },
      include: { 
        d_clients_application_pay: {
          select: {
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
      const sumPayAll = data[0].d_clients_application_pay.reduce((a,b) => (a + Number(b.sum_pay)),0);
      const sunProductTotal = data[0]?.d_clients_application_products.reduce((a,b) => (a + (Number(b.total) * b.count_product)),0); 
      if(Number((sunProductTotal - sumPayAll).toFixed(2)) >= sumPay) {
        prisma.d_clients_application_pay.create({
          include: {
            d_user: {
              select: {
                s_role: {
                  select: {
                    role_name: true,
                  }
                }
              }
            },
            d_clients_application: {
              select: {
                id: true,
                d_clients_application_products: true,
              }
            }
          },
          data: {
              d_clients_application: {
                  connect: {
                      id: applicationId
                  },
              },
              sum_pay: Number(sumPay),
              pay_date: new Date(),
              d_user: {
                  connect: {
                      id: userId,
                  }
              },
          }
        }).then(data => {
          const sum = data.d_clients_application.d_clients_application_products.reduce((a,b) => (a + (Number(b.total) * b.count_product)),0);
          const onePercent = sum / 100;
          const product = data.d_clients_application.d_clients_application_products?.map(item => ({
            id: item.id,
            total: Number(item.total) * item.count_product,
            percent: Number(item.total) * item.count_product / onePercent,
            sumPay: (Number(item.total) * item.count_product / onePercent) * sumPay / 100
          }));
          const requestData = {
            id: data.id,
            applicationId: data.d_clients_application_id,
            number: data.pay_number,
            date: moment(data.pay_date).format('DD.MM.YYYY'),
            count: data.sum_pay,
            employeeName: data.user_name,
            employeeJobPos: data.d_user.s_role.role_name,
            paid: Number(sunProductTotal - (sumPayAll + sumPay).toFixed(2))
          }
    
          product.forEach(item => { // Добавляем дитализацию по оплате
            prisma.d_clients_application_pay_detail.create({
              include: {
                d_clients_application_pay: false,
                d_clients_application_products: false,
              },
              data: { 
                sum_pay: item.sumPay,
                d_clients_application_pay: {
                  connect: {
                      id: requestData.id
                  },
              },
                d_clients_application_products: {
                  connect: {
                    id: item.id
                  }
                }
              }
            }).then(() => {
              return null; 
            }).catch(err => {
              return res.status(500).send({ message: err.message || "Error" });
            }); 
          }); 
          return res.status(200).send(requestData);
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

export default postPayment