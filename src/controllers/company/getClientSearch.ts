import { Request, Response } from 'express'
import prisma from '../../../prisma'

const getClientSearch = (req: Request, res: Response) => {
  const searchText = String(req.query.searchText);
  if(searchText) {
    prisma.d_clients.findMany({
      where: {
        OR: [{
          client_name: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          address: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          email: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          phone_number1: { 
            contains: searchText,
            mode: "insensitive"
          }
        }]
      }
    }).then(data => {
      const requestData = data?.map(item => (
        { 
          id: item.id,
          name: item.client_name,
          address: item.address,
          email: item.email,
          phone: item.phone_number1,
        }
      ))
      res.status(200).send(requestData);
    }).catch(err => {
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Текст поиска пустое'});
  
};

export default getClientSearch