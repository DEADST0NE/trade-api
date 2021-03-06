import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

import paidStatus from '../../utils/paidStatus'

const getClients = (req: Request, res: Response) => {
  const companieId = String(req.query.companieId); 
  const searchText = req.query.searchText && String(req.query.searchText);
  if(companieId) {
    prisma.d_companies_clients.findMany({
      where: searchText ? {
        d_companies_id: companieId,
        OR: [{
          d_clients: {
            client_name: { 
              contains: searchText,
              mode: "insensitive"
            }
          }
        },{
          d_clients: {
            address: { 
              contains: searchText,
              mode: "insensitive"
            }
          }
        },{
          d_clients: {
            email: { 
              contains: searchText,
              mode: "insensitive"
            }
          }
        },{
          d_clients: {
            phone_number1: { 
              contains: searchText,
              mode: "insensitive"
            }
          }
        }]
      } : {
        d_companies_id: companieId
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

      interface requestDataType<TValue> {
        [id: string]: TValue;
      }

      interface clientsType {
        key: string,
        id: string,
        name: string,
        address: string,
        email: string,
        phone: string,
        dateAdd: string,
        clientsCategory: {
          value: string | undefined,
          label: string | undefined,
        },
        applicationStatistic: {
          count: number,
          stages: number[]
        },
        debt?: any
      }

      const requestData: requestDataType<clientsType> = {} 

      data.forEach((item) => {
        requestData[item.d_clients.id] = {
          key: item.id,
          id: item.d_clients.id,
          name: item.d_clients.client_name,
          address: item.d_clients.address,
          email: item.d_clients.email,
          phone: item.d_clients.phone_number1,
          dateAdd: moment(item.date_add).format('DD.MM.YYYY'),
          clientsCategory: {
            value: item?.d_companies_clients_category?.id,
            label: item?.d_companies_clients_category?.category_name
          },
          applicationStatistic: {
            count: item.d_clients.d_clients_application.length,
            stages: item.d_clients.d_clients_application.map(stage => ( stage.d_clients_application_routes_stage[0].s_routes_stage_id )).reduce((acc: any, el) => {
              acc[el] = (acc[el] || 0) + 1; return acc;
            }, {})
          },
          debt: paidStatus(item.d_clients.d_clients_application)
        };
      }); 

      res.status(200).send(requestData);
    }).catch(err => { 
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id компании не был передан' });
  
};

export default getClients