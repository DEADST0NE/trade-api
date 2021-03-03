import { Request, Response } from 'express'
import prisma from '../../../prisma'

const getClientCategoryCompany = (req: Request, res: Response) => { 
  const clientId = req.query.clientId && String(req.query.clientId);

  if(clientId) {
    prisma.d_companies.findMany({
      where: { 
        d_companies_clients: {
          some: {
            d_clients: {
              id: clientId,
            }
          }
        } 
      },
      select: {
        id: true,  
        companies_name: true,
        address: true,
        d_companies_products_types: {
          select: {
            id: true,
            type_name: true,
            d_companies_products: true
          }
        }
      }
    }).then((data) => { 

      interface requestDataType<TValue> {
        [id: string]: TValue;
      }

      interface catygoryType {
        id: string;
        name: string; 
        address: string;
        categories: {
          id: string | undefined,
          name: string,
          count: number
        }[]; 
      }

      const requestData: requestDataType<catygoryType> = {}

      data.forEach( item => {
        requestData[item.id] = {
          id: item.id,
          name: item.companies_name,
          address: item.address,
          categories: [
            {
              id: undefined,
              name: 'Все товары',
              count: item.d_companies_products_types.reduce((sum, e) => sum = sum + e.d_companies_products.length, 0) 
            },
            ...item.d_companies_products_types.map((category) => ({
              id: category.id,
              name: category.type_name,
              count: category.d_companies_products.length
            }))
          ]
        }
      });

      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default getClientCategoryCompany