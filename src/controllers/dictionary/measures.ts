import { Request, Response } from 'express'
import prisma from '../../../prisma'

const dictionaryMeasures = (req: Request, res: Response) => { 
  prisma.s_unit_measure.findMany().then((data) => {
    const requsetData = data.map(item => ({
      value: item.id,
      label: item.unit_name
    }));
    return res.status(200).json(requsetData);
  }).catch((err) => {
      res.status(500).send({ message: err.message || "Error" });
  });
}

export default dictionaryMeasures