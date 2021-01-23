import { Request, Response } from 'express'
import prisma from '../../../prisma' 
import ClientFtp from 'ftp'

const putProducts = async (req: Request, res: Response) => {
  const manufactureId: string = req.body.manufactureId;
  const сategoryId: string = req.body.сategoryId;
  const productsId: string = req.body.productsId;
  const productsName: string = req.body.productsName;
  const measureType: number = req.body.measureType;
  const description: string = req.body.description;
  const code: string = req.body.code;
  const weight: number = req.body.weight && Number(req.body.weight);
  const priceArray:{
    id?:string
    categoryClient: string,
    price: number
  }[] = req.body.priceArray; 
  const imgProduct: string = req.body.imgProduct;
  console.log(req.body);
  if(productsId && productsName && measureType && priceArray && сategoryId && manufactureId) {
  
    const fotoPut = async (id: string, imgProduct: string) => await new Promise((resolve, reject) => { 
      const clientFtp = new ClientFtp;

      clientFtp.connect({
        host: process.env.FTP_HOST,
        port: Number(process.env.FTP_PORT),
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD
      }); 

      clientFtp.on('ready', () => {
        clientFtp.append(Buffer.from(imgProduct, 'base64'), `./company/products/img/${id}.png`, (err) => {
          if (err) throw err;
          clientFtp.end();
          resolve(true);
        });
      });
    });

    if(imgProduct) await fotoPut(productsId, imgProduct);

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
        code: code,
        d_companies_manufacturers: {
          connect: {
            id: manufactureId,
          }
        }, 
        s_unit_measure: {
          connect: {
            id: measureType,
          }
        },
        d_companies_products_types: {
          connect: {
            id: сategoryId,
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
        code: true,
        d_companies_manufacturers: {
          select: {
            id: true,
            manufacturer_name: true,
          }
        },
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
      }
    }).then( async (data) => {  

      const requestData = {
        id: data.id,
        avatarProduct:  `http://${res.req?.headers.host}/api/img/product/?id_img=${data.id}`,
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
        },
        code: data.code,
        manufacturer: {
          id: data.d_companies_manufacturers.id,
          name: data.d_companies_manufacturers.manufacturer_name
        }
      };
      res.status(200).json(requestData);

    }).catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id клиента или категории не был передан' });
  
};

export default putProducts