import { Request, Response } from 'express'
import prisma from '../../../prisma'

const putCategory = (req: Request, res: Response) => { 
  const companyId = req.body.companyId && String(req.body.companyId);
  const categoryName = req.body.categoryName && String(req.body.categoryName); 
  if(companyId && categoryName) {
    prisma.d_companies_products_types.create({ 
      data: {
        type_name: categoryName,
        d_companies: {
          connect: {
            id: companyId,
          }
        }
      },
      select: {
        id: true,
        type_name: true,
        d_companies_products: {
          select: {
              id: true
          }
      }
      }
    }).then((data) => {
      const requsetData = {
        value: data.id,
        label: data.type_name,
        count: data.d_companies_products.length
      };
      return res.status(200).json(requsetData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default putCategory