import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment' 

const paidStatus = (pay: {total: number | null}[]  , paid: {sum_pay: number}[]) => {
  let payTotal = pay?.reduce((a:any, b:any) => a+(b.total || 0), 0);
  let paidTotal = paid?.reduce((a:any, b:any) => a+b.sum_pay, 0);
  if(payTotal - paidTotal <= 0) return 0;
  else return payTotal - paidTotal;
}

type productsType = {
  products: {
    id: string,
    count: number;
  }[];
  companyId: string; 
};

const postClientApplication = (req: Request, res: Response) => { 
  const clientId = req.body.clientId && String(req.body.clientId); 
  const companyProducts: productsType[] = req.body.companyProducts;
  console.log()
  if (clientId && companyProducts.length) {
    let requestData: any = {};
    companyProducts.forEach( cPItem => {
      prisma.d_clients_application.create({
        data: {
          application_date: new Date(),
          application_time: new Date(),
          date_execution: new Date(new Date().setTime(new Date().getTime() + 30 * 86400000)),
          d_clients: {
            connect: {
              id: clientId
            }
          },
          d_clients_application_products: {
            create: cPItem.products.map( item => (
              {
                count_product: item.count,
                d_companies_products: {
                  connect: {
                    id: item.id
                  }
                }
            }))
          },
          d_clients_application_routes_stage: {
            create: {
              d_user: {
                  connect: {
                      id: "00000000-0000-0000-0000-000000000000" //user Система
                  }
              },
              s_routes_stage: {
                  connect: {
                      id: 1
                  }
              },
              count_day_execution: 0,
              user_name: ''
            }
          }
        },
        select: {
          id: true,
          application_number: true,
          application_date: true,
          d_clients: {
            select: {
              client_name: true,
              address: true,
              email: true,
              phone_number1: true, 
            }
          },
          d_clients_application_products: {
            select: { total: true }
          },
          d_clients_application_pay: {
            select: { sum_pay: true }
          },
          d_clients_application_routes_stage: {
            orderBy: { stage_date: "desc" },
              select: {
                s_routes_stage_id: true,
                stage_date: true
              }, 
          }
        }
      }).then((data) => {
        const temporayRequestData = {
          id: data.id,
          number: Number(data.application_number),
          date: {
            date: moment(data.application_date).format('DD.MM.YYYY'),
            time: moment(data.application_date).format('hh:mm:ss')
          },
          clientName: data.d_clients.client_name,
          clientAddress: data.d_clients.address,
          clientEmail: data.d_clients.email,
          clientTel1: data.d_clients.phone_number1,
          pay: data.d_clients_application_products.reduce((a, b) => a+Number(b.total || 0), 0),
          stages: data.d_clients_application_routes_stage.map((stage) => ( stage.s_routes_stage_id ))
        } 
        requestData[data.id] = temporayRequestData;
      }).catch((err) => {
          res.status(500).send({ message: err.message || "Error" });
      });
    })
    console.log(requestData);
    return res.status(200).json(requestData);
  }
  else res.status(400).json({ message: 'Один из входных данных не заполнен' });
}

export default postClientApplication