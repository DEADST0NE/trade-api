import { Request, Response } from 'express'
import prisma from '../../../prisma'
import ClientFtp from 'ftp'

interface requestDataType<TValue> {
  [id: string]: TValue;
}

interface priceType {
  id: string;
  count: number;
  category: {
    value: string;
    label: string;
  }
}

interface productType {
  id: string;
  avatarProduct: any;
  name: string | null;
  price: priceType[];
  weight: number | null;
  description: string | null;
  measure: {
    value: number;
    label: string;
  }
}

const getProducts = (req: Request, res: Response) => {
  const companyId = req.query.company_id && String(req.query.company_id);
  const skip = req.query.skip ? Number(req.query.skip) : undefined;
  const take = req.query.take ? Number(req.query.take) : undefined;
  
  if (companyId) {
    prisma.d_companies_products.findMany({
      skip: skip,
      take: take,
      where: {
        d_companies: {
          id: companyId 
        }
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
      }
    }).then( async (data) => { 
      let foto = async (id: string) => await new Promise((resolve, reject) => { 
        const clientFtp = new ClientFtp;

        clientFtp.connect({
          host: process.env.FTP_HOST,
          port: Number(process.env.FTP_PORT),
          user: process.env.FTP_USER,
          password: process.env.FTP_PASSWORD
        }); 

        clientFtp.on('ready', () => {
          clientFtp.get(`./company/products/img/${id}.png`,(err, stream) => { 
            if (err) {
              clientFtp.end();
              return resolve('');
            };
            let data = Buffer.alloc(0);
            stream.on('data', chunk => data = Buffer.concat([data, chunk]));
            stream.on('error', (err) => { console.log(err); reject });
            stream.once('close', () => { clientFtp.end(); resolve(`data:image/png;base64, ${data.toString('base64')}`) }); 
          });
        });
      });

      const requestData: requestDataType<productType> = {}; 

      const generateProduct = async (product: typeof data[0] ) => ({
        id: product.id,
        avatarProduct: await foto(product.id),
        weight: product.weight,
        description: product.description,
        price: product.d_companies_products_price.map((price: any) => ({
          id: price.id,
          category: {
            value: price.d_companies_clients_category.id,
            label: price.d_companies_clients_category.category_name,
          },
          count: price.price,
        })),
        name: product.product_name, 
        measure: {
          value: product.s_unit_measure.id,
          label: product.s_unit_measure.unit_name
        }
      })

      for await (const product of data) { 
        requestData[product.id] = await generateProduct(product)
      };

      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id компании не заполнен' });
}

export default getProducts