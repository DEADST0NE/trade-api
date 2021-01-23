import { Request, Response } from 'express'
import prisma from '../../../prisma' 
import ClientFtp from 'ftp'


const fotoDelete = async (id: string) => await new Promise((resolve, reject) => { 
  const clientFtp = new ClientFtp;

  clientFtp.connect({
    host: process.env.FTP_HOST,
    port: Number(process.env.FTP_PORT),
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD
  }); 

  clientFtp.on('ready', () => {
    clientFtp.delete(`./company/products/img/${id}.png`, (err) => {
      if (err) {
        resolve(true);
      };
      clientFtp.end();
      resolve(true);
    });
  });
});


const deleteProducts = async (req: Request, res: Response) => {
  const productId: string | undefined = req.query.productId && String(req.query.productId);
  console.log(productId, req.params);
  if(productId) {
    prisma.d_companies_products.update({
      where: {
        id: productId
      },
      data: {
        is_remove: true,
      },
      select: {
        id: true,
        weight: true,
        description: true,
        product_name: true,
        s_unit_measure: {
          select: {
            id: true,
            unit_name: true,
          }
        }, 
        d_companies_products_types: {
          select: {
            id: true
          }
        },
        d_companies_products_price: {
          select: {
            id: true,
            d_companies_clients_category: {
              select: {
                id: true,
                category_name: true,
              }
            },
            price: true,
          }
        }, 
      }, 
    }).then( async (data) => {
      await fotoDelete(productId);
      res.status(200).json(data.id); 
    }).catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id клиента или категории не был передан' }); 
};

export default deleteProducts