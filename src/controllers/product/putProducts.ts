import { Request, Response } from 'express'
import prisma from '../../../prisma' 
import ClientFtp from 'ftp'

const putProducts = async (req: Request, res: Response) => {

  const productsId: string = req.body.productsId;
  const productsName: string = req.body.productsName;
  const measureType: number = req.body.measureType;
  const description: string = req.body.description;
  const weight: number = req.body.weight && Number(req.body.weight);
  const priceArray:{
    id?:string
    categoryClient: string,
    price: number
  }[] = req.body.priceArray; 
  const imgProduct: string = req.body.imgProduct;
  
  if(productsId && productsName && measureType && priceArray) {
  
    const fotoPut = async (id: string) => await new Promise((resolve, reject) => { 
      const clientFtp = new ClientFtp;

      clientFtp.connect({
        host: process.env.FTP_HOST,
        port: Number(process.env.FTP_PORT),
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD
      }); 

      clientFtp.on('ready', () => {
        clientFtp.put(Buffer.from(imgProduct, 'base64'), `./company/products/img/${id}.png`, (err) => {
          if (err) throw err;
          clientFtp.end();
          resolve(true);
        });
      });
    });

    await fotoPut(productsId);

    prisma.d_companies_products_price.findMany({
      where: {
        d_companies_products_id: productsId
      },
      select: {
        id: true,
      } 
    }).then(data => {
      data.forEach( item => {
        if(!priceArray.some(priceItem => priceItem.id === item.id )) {
          prisma.d_companies_products_price.delete({
            where: {
              id: item.id
            }
          }).catch(err => {
            res.status(500).send({ message: err.message || "Error" });
          });
        }
      })
    }).catch(err => {
      res.status(500).send({ message: err.message || "Error" });
    });

    prisma.d_companies_products.update({
      where: {
        id: productsId,
      },
      data: {
        weight: weight,
        description: description,
        product_name: productsName,
        s_unit_measure: {
          connect: {
            id: measureType,
          }
        }, 
        d_companies_products_price: {
          upsert: priceArray.map( item => ({
            create: {
              price: Number(item.price),
              date_start: new Date(),
              d_companies_clients_category: {
                connect: {
                  id: item.categoryClient
                }
              }
            },
            update: {
              price: Number(item.price),
              date_start: new Date(),
              d_companies_clients_category: {
                connect: {
                  id: item.categoryClient
                }
              }
            },
            where: { id: item.id ? item.id : '27a83304-0c5a-4f60-a33f-44040d4d1659' },
          })),
        },
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

      const fotoGet = async (id: string) => await new Promise((resolve, reject) => { 
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
              return resolve('')
            };
            let data = Buffer.alloc(0);
            stream.on('data', chunk => data = Buffer.concat([data, chunk]));
            stream.on('error', (err) => { console.log(err); reject });
            stream.once('close', () => { clientFtp.end(); resolve(`data:image/png;base64, ${data.toString('base64')}`) }); 
          });
        });
      });

      const requestData = {
        id: data.id,
        avatarProduct: await fotoGet(data.id),
        weight: data.weight,
        description: data.description,
        price: data.d_companies_products_price.map(price => ({
          id: price.id,
          category: {
            value: price.d_companies_clients_category.id,
            label: price.d_companies_clients_category.category_name,
          },
          count: price.price,
        })),
        name: data.product_name,
        measure: {
          value: data.s_unit_measure.id,
          label: data.s_unit_measure.unit_name
        }
      };
      res.status(200).send(requestData);

    }).catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id клиента или категории не был передан' });
  
};

export default putProducts