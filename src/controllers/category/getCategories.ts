import { Request, Response } from 'express'
import prisma from '../../../prisma'

const getCategory = (req: Request, res: Response) => { 
  const companyId = req.query.companyId && String(req.query.companyId);

  if(companyId) {
    prisma.d_companies_products_types.findMany({
      where: {
        d_companies_id: companyId,
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
      const requsetData = data.map(item => ({
        value: item.id,
        label: item.type_name,
        count: item.d_companies_products.length
      }));
      return res.status(200).json(requsetData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default getCategory