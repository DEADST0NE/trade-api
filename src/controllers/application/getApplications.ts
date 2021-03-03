import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

const paidStatus = (pay: {total: number | null}[]  , paid: {sum_pay: number}[]) => {
  let payTotal = pay?.reduce((a:any, b:any) => a+(b.total || 0), 0);
  let paidTotal = paid?.reduce((a:any, b:any) => a+b.sum_pay, 0);
  if(payTotal - paidTotal <= 0) return 0;
  else return payTotal - paidTotal;
}

const getApplications = (req: Request, res: Response) => {
  const companyId = req.query.company_id && String(req.query.company_id);
  const clientId = req.query.client_id && String(req.query.client_id); 
  console.log(companyId);
  if (companyId || clientId) {
    prisma.d_clients_application.findMany({
      where: { 
        d_clients: {
            OR: [{
              s_accounts: {
                d_user: {
                  some: {
                    d_companies: {
                      id: companyId
                    }
                  } 
                }
                }
            },
            { 
              id: clientId 
            }]
        }, 
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
          select: { sum_pay: true }
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
            d_companies_products: {
              select: {
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
      interface requestDataType<TValue> {
        [id: string]: TValue;
      }

      interface applicationType {
        id: string;
        number: number;
        date: {
          date: string;
          time: string;
        }
        paid: number;
        pay: number;
        stages: number[];
        clientAddress: string;
        clientEmail: string;
        clientName: string;
        clientTel1: string;
        companyName: string;
        productLength: number;
      }

      const requestData: requestDataType<applicationType> = {}
      data.forEach((item) => {
        requestData[item.id] = {
          id: item.id,
          number: Number(item.application_number),
          date: {
            date: moment(item.application_date).format('DD.MM.YYYY'),
            time: moment(item.application_date).format('hh:mm:ss')
          },
          clientName: item.d_clients.client_name,
          productLength: item.d_clients_application_products.length,
          clientAddress: item.d_clients.address,
          clientEmail: item.d_clients.email,
          clientTel1: item.d_clients.phone_number1,
          companyName: item.d_clients_application_products[0].d_companies_products.d_companies_manufacturers.d_companies.companies_name,
          pay: item.d_clients_application_products.reduce((a, b) => a+(b.total || 0), 0),
          paid: Number(paidStatus(item.d_clients_application_products, item.d_clients_application_pay).toFixed(2)),
          stages: item.d_clients_application_routes_stage.map((stage) => ( stage.s_routes_stage_id ))
        };
      }); 
      return res.status(200).json(requestData);
    }).catch((err) => {
      console.log(err);
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Один из входных данных не заполнен' });
}

export default getApplications