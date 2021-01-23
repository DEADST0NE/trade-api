import { Request, Response } from 'express'
import prisma from '../../../prisma'

const deleteManufacturers = (req: Request, res: Response) => {
  const manufacturerId: string = String(req.query.manufacturerId); 

  if (manufacturerId) {
    prisma.d_companies_manufacturers.delete({
      where: { id: manufacturerId },
      select: { id: true }
    }).then((data) => { 
      return res.status(200).json(data.id);
    }).catch(err => { 
      return res.status(500).send({ message: "Ошибка, производитель находится в связке с товарами. Очистите товары для успешного удаления" });
    });
  } else res.status(400).send({ message: "Id производителя не заполненно" });
};

export default deleteManufacturers