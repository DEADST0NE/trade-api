import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

import paidStatus from '../../utils/paidStatus'

const postClient = (req: Request, res: Response) => { 
  const companyId = req.body.companyId; 
  const clientId = req.body.clientId;
  if(companyId && clientId) {
    prisma.d_companies_clients.create({
      data: {
        d_companies: {
          connect: {
            id: companyId
          }
        },
        d_clients: {
          connect: {
            id: clientId
          }
        },
      },
      select: {
        id: true,
        d_companies_id: false,
        date_add: true,
        d_clients: {
          select: {
            id: true,
            client_name: true,
            address: true,
            email: true,
            phone_number1: true,
            d_clients_application: {
              select: {
                application_number: true,
                d_clients_application_pay: {
                  select: {
                    sum_pay: true,
                  }
                },
                d_clients_application_products: {
                  select: {
                    total: true,
                  }
                },
                d_clients_application_routes_stage: {
                  orderBy: { stage_date: "desc" },
                  select: {
                    s_routes_stage_id: true
                  }
                }
              }
            }
          }
        },
        d_companies_clients_category: {
          select: {
            id: true,
            category_name: true,
          }
        }
      }
    }).then(data => {
      const requestData = { 
        key: data.id,
        id: data.d_clients.id,
        name: data.d_clients.client_name,
        address: data.d_clients.address,
        email: data.d_clients.email,
        phone: data.d_clients.phone_number1,
        dateAdd: moment(data.date_add).format('DD.MM.YYYY'),
        clientsCategory: {
          value: data?.d_companies_clients_category?.id,
          label: data?.d_companies_clients_category?.category_name
        },
        applicationStatistic: {
          count: data.d_clients.d_clients_application.length,
          stages: data.d_clients.d_clients_application.map(stage => ( stage.d_clients_application_routes_stage[0].s_routes_stage_id )).reduce((acc: any, el) => {
            acc[el] = (acc[el] || 0) + 1; return acc;
          }, {})
        },
        debt: paidStatus(data.d_clients.d_clients_application)
      }
      res.status(200).send(requestData);
    }).catch(err => { 
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Один из обязательных параметров не задан' });
  
};

export default postClient