import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

const paidStatus = (pay: any[], paid: any[]) => { 
  let payTotal = pay?.reduce((a:any, b:any) => a + Number((b.total || 0)), 0);
  let paidTotal = paid?.reduce((a:any, b:any) => a + Number(b.sum_pay), 0);
  if(payTotal - paidTotal <= 0) return 0;
  else return payTotal - paidTotal;
} 

interface filterPriceType {
  min:number, 
  max: number 
}

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

const getApplications = (req: Request, res: Response) => {
  const companyId = req.query.company_id as string | undefined;
  const clientId = req.query.clientId as string | undefined;
  const filterPrice = req.query.filterPrice as string | undefined;
  const filterDebtStatus = req.query.filterDebtStatus as boolean | undefined;
  const filterStage = req.query.filterStage as number | undefined;
  const filterCompany = req.query.filterCompany as string[] | undefined ; 
  if (companyId || clientId) {
    prisma.d_clients_application.findMany({
      where: { 
        OR: clientId ? {
          d_clients: {
            id: clientId 
          }
        } :{
          d_clients_application_products: { 
            some: {
              d_companies_products: { 
                d_companies_manufacturers: {
                  d_companies: {
                    id: companyId
                  }
                } 
              }
            }}
        }
      },
      select: {
        id: true,
        application_number: true,
        application_date: true,
        application_time: true,
        d_clients:{
            select: {
              id: true,
              client_name: true,
              address: true,
              email: true,
              phone_number1: true,
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
                        id: true,
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
    }).then((pData) => { 
      let data = pData;
      // фильтр цены
      if(filterPrice) {
        const filterData = JSON.parse(filterPrice) as filterPriceType;
        data = data.filter( item => {
          const totalApp = item.d_clients_application_products.reduce( (sum: number, {total}) => (Number(total) ? Number(total) + sum : sum), 0);
          return filterData.min <= totalApp && totalApp <= filterData.max ? true : false; 
        })
      }
      //-----------
      //фильтр стуса задолжности 
      if(filterDebtStatus) { 
        data = data.filter( item => Number(paidStatus(item.d_clients_application_products, item.d_clients_application_pay).toFixed(2)) > 0 ? true : false )
      }
      //------------------------
      //фильтер этапа
      if(filterStage) {
        data = data.filter( item => {
          const stage = item.d_clients_application_routes_stage[0].s_routes_stage_id; 
          return Number(filterStage) === stage ? true : false;
        })
      }
      //-------------
      //фильте компаний
      if(filterCompany) {
        data = data.filter( item => {
          for(const fItem of filterCompany) {
            if(fItem === item.d_clients_application_products[0].d_companies_products.d_companies_manufacturers.d_companies.id) {
              return true;
            }
          }
          return false;
        })
      }
      //---------------
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
          pay: item.d_clients_application_products.reduce((a, b) => a + Number(b.total || 0), 0),
          paid: Number(paidStatus(item.d_clients_application_products, item.d_clients_application_pay).toFixed(2)), 
          stages: item.d_clients_application_routes_stage.map((stage) => ( stage.s_routes_stage_id ))
        };
      }); 
       res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Один из входных данных не заполнен' });
}

export default getApplications