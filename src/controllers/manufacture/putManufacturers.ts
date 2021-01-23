import { Request, Response } from 'express'
import prisma from '../../../prisma'

const putManufacturers = (req: Request, res: Response) => { 
  const manufacturerId = req.body.manufacturerId && String(req.body.manufacturerId);
  const manufacturerName = req.body.manufacturerName && String(req.body.manufacturerName);
  const address = req.body.address && String(req.body.address);
  const email = req.body.email && String(req.body.email);
  const phone = req.body.phone && String(req.body.phone);
  if(manufacturerId && manufacturerName && address && email && phone) {
    prisma.d_companies_manufacturers.update({
      where: {
        id: manufacturerId
      },
      data: { 
        manufacturer_name: manufacturerName,
        address: address,
        email: email,
        phone_number1: phone
      },
      select: {
        id: true, 
        manufacturer_name: true,
        address: true,
        email: true,
        phone_number1: true
      }
    }).then((data) => { 
      
      const requestData = {
        id: data.id,
        name: data.manufacturer_name, 
        address: data.address,
        email: data.email,
        phone: data.phone_number1, 
      }; 
      
      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default putManufacturers