import { Request, Response } from 'express'
import prisma from '../../../prisma'

const deleteCategory = (req: Request, res: Response) => { 
  const categoryId = req.query.categoryId && String(req.query.categoryId);
  if(categoryId) {
    prisma.d_companies_products_types.delete({
      where: {
        id: categoryId,
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
        res.status(500).send({ message: "Категория находится в связке с другими продуктами, переместите продукты в другую категорию" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default deleteCategory