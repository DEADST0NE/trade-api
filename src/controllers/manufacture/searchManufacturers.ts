import { Request, Response } from 'express'
import prisma from '../../../prisma'

const searchManufacturers = (req: Request, res: Response) => { 
  const companyId = req.query.companyId && String(req.query.companyId);
  const searchText = req.query.searchText && String(req.query.searchText);
  
  if(companyId && searchText) {
    prisma.d_companies_manufacturers.findMany({ 
      where: {
        d_companies_id: companyId,
        OR: [{
          manufacturer_name: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          address: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          email: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          phone_number1: { 
            contains: searchText,
            mode: "insensitive"
          }
        }]
      },
      select: {
        id: true, 
        manufacturer_name: true,
        address: true,
        email: true,
        phone_number1: true,
        d_companies_products: {
          select: {
            id: true
          }
        }
      }
    }).then((data) => {


      interface requestDataType<TValue> {
        [id: string]: TValue;
      } 

      interface manufactureType {
        id: string,
        name: string, 
        address: string,
        email: string,
        phone: string,
        productNumber: number,
      }

      const requestData: requestDataType<manufactureType> = {} 

      data.forEach((item) => {
        requestData[item.id] = {
          id: item.id,
          name: item.manufacturer_name, 
          address: item.address,
          email: item.email,
          phone: item.phone_number1,
          productNumber: item.d_companies_products.length,
        };
      });

      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default searchManufacturers