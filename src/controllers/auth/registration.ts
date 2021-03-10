import { Request, Response } from 'express'
import prisma from '../../../prisma'

import { getToken } from '../../utils/token'
import { hash } from '../../utils/bcrypt' 

const registration = async (req: Request, res: Response) => { 
  const email = req.body.email && String(req.body.email);
  const password = req.body.password && String(req.body.password);
  const phone = req.body.phone && String(req.body.phone);
  const address = req.body.address && String(req.body.address);
  const name = req.body.name && String(req.body.name);

  if(email && password && phone && address && name) { 
    const passwordHash = await hash(password);
    prisma.s_accounts.create({ 
      data: {
        login: email,
        password: passwordHash,
        s_role: {
          connect: {
            id: 3
          }
        },
        d_clients: {
          create: {
            client_name: name,
            address: address,
            email: email,
            phone_number1: phone,
            password: passwordHash,
          }
        }
      },
      select: {
        id: true,
        d_clients: true,
      }
    }).then((data) => {
      const requsetData = {
        id: data.d_clients[0].id,
        accountId: data.id,
        email: data.d_clients[0].email,
        name: data.d_clients[0].client_name,
        phone: data.d_clients[0].phone_number1,
        address: data.d_clients[0].address
      };
      return res.status(200).json({ ...getToken({
        ...requsetData
      }) });
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).send({ message: 'id компании обязателен' || "Error" });
}

export default registration