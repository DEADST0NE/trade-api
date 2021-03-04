import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

const paidStatus = (pay: {total: number | null}[]  , paid: {sum_pay: number}[]) => {
  let payTotal = pay?.reduce((a:any, b:any) => a+(b.total || 0), 0);
  let paidTotal = paid?.reduce((a:any, b:any) => a+b.sum_pay, 0);
  if(payTotal - paidTotal <= 0) return 0;
  else return payTotal - paidTotal;
}

const getApplicationDitail = (req: Request, res: Response) => {
  const applicationId = req.query.applicationId && String(req.query.applicationId);  

  if (applicationId) {
    prisma.d_clients_application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        d_clients: {
            include: {
              d_companies_clients: {
                select: { d_companies_id: true }
              }
            }
        },
        d_clients_application_pay: {
          select: { 
            id: true,
            pay_date: true,
            sum_pay: true,
            d_user: {
              select: {
                user_name: true
              }
            }
           }
        },
        d_clients_application_routes_stage: {
            orderBy: { stage_date: "desc" },
            select: {
              s_routes_stage_id: true,
              stage_date: true
            }, 
        },
        d_clients_application_products: {
          select: { 
            count_product: true,
            d_companies_products: { 
              select: {
                id: true,
                product_name: true,
                d_companies_manufacturers: {
                  select: {
                    d_companies: {
                      select: {
                        companies_name: true, 
                      }
                    }
                  }
                }
              }
            },
            total: true
           }
        },
      }
    }).then((data) => {
      let requestData = {};

      if(data) {
        requestData = {
          id: data.id,
          number: Number(data.application_number),
          date: {
            date: moment(data.application_date).format('DD.MM.YYYY'),
            time: moment(data.application_date).format('hh:mm:ss')
          },
          clientName: data.d_clients.client_name,
          productLength: data.d_clients_application_products.length,
          clientAddress: data.d_clients.address,
          clientEmail: data.d_clients.email,
          clientTel1: data.d_clients.phone_number1,
          companyName: data.d_clients_application_products[0].d_companies_products.d_companies_manufacturers.d_companies.companies_name,
          pay: data.d_clients_application_products.reduce((a, b) => a+Number(b.total || 0), 0),
          stages: data.d_clients_application_routes_stage.map((stage) => ( stage.s_routes_stage_id )),
          pays: data.d_clients_application_pay.map((pay) => ({
            id: pay.id,
            date: moment(pay.pay_date).format('DD.MM.YYYY'),
            fioAdd: pay.d_user.user_name, 
            total: pay.sum_pay
          })),
          products: data.d_clients_application_products.map((product) => ({
            id: product.d_companies_products.id,
            avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${product.d_companies_products.id}`,
            productName: product.d_companies_products.product_name,
            count: product.count_product,
            price: product.total
          }))
        }
      }
      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Один из входных данных не заполнен' });
}

export default getApplicationDitail