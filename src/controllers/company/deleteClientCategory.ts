import { Request, Response } from 'express'
import prisma from '../../../prisma'

const deleteClientCategory = (req: Request, res: Response) => {
  const companyId: string = String(req.query.companyId);
  const categoryId: string = String(req.query.categoryId);

  if (companyId && categoryId) {
    prisma.d_companies_clients_category.delete({
      where: { id: categoryId },
    }).then(() => { 
      prisma.d_companies_clients_category.findMany({
        where: {
          d_companies_id: companyId
        },
      }).then(data => {
        const requestData = data?.map(item => (
          { 
            value: item.id,
            label: item.category_name
          }
        ))
        res.status(200).send(requestData);
      }).catch(err => {
        res.status(500).send({ message: err.message || "Error" });
      });
    }).catch(err => { 
      return res.status(500).send({ message: err.message || "Error" });
    });
  } else res.status(400).send({ message: "Id компании или наименование категории не заполненно" });
};

export default deleteClientCategory