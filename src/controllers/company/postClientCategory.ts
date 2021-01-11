import { Request, Response } from 'express'
import prisma from '../../../prisma'

const postClientCategory = (req: Request, res: Response) => {

  const companyId: string = req.body.companyId; 
  const categodyValue: string = req.body.categodyValue;  
  if (companyId && categodyValue) {
    prisma.d_companies_clients_category.create({
      data: {
        d_companies: {
          connect: {
            id: companyId
          }
        },
        category_name: categodyValue
      }
    }).then(data => { 
      const requestData = { 
        label: data.category_name,
        value: data.id,
      }  
      return res.status(200).send(requestData); 
    }).catch(err => { 
      return res.status(500).send({ message: err.message || "Error" });
    });
  } else res.status(400).send({ message: "Id компании или наименование категории не заполненно" });
};

export default postClientCategory