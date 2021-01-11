import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

interface statisticStageType {
  [id: number]: number;
}

const getClientCategory = (req: Request, res: Response) => {
  const companieId = String(req.query.companieId);
  if(companieId) {
    prisma.d_companies_clients_category.findMany({
      where: {
        d_companies_id: companieId
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
  }
  else res.status(400).json({ message: 'Id компании не был передан' });
  
};

export default getClientCategory