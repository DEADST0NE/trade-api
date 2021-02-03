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
  if (companyId || clientId) {
    prisma.d_clients_application.findMany({
      where: {
        d_clients: {
            OR: [{
                d_companies_clients: {
                    some: {
                        d_companies_id: {
                            equals: companyId
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
          select: { total: true }
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
          clientAddress: item.d_clients.address,
          clientEmail: item.d_clients.email,
          clientTel1: item.d_clients.phone_number1,
          pay: item.d_clients_application_products.reduce((a, b) => a+(b.total || 0), 0),
          paid: Number(paidStatus(item.d_clients_application_products, item.d_clients_application_pay).toFixed(2)),
          stages: item.d_clients_application_routes_stage.map((stage) => ( stage.s_routes_stage_id ))
        };
      }); 
      return res.status(200).json(requestData);
    }).catch((err) => { 
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Один из входных данных не заполнен' });
}

export default getApplications