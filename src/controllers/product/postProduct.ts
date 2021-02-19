import { Request, Response } from 'express'
import prisma from '../../../prisma' 
import ClientFtp from 'ftp'


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


const postProducts = async (req: Request, res: Response) => { 
  const manufacturerId: string = req.body.manufacturerId;
  const categoryId: string = req.body.сategoryId; 
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
  if(productsName && measureType && priceArray && categoryId && manufacturerId && code) {
    prisma.d_companies_products.create({ 
      data: {
        weight: weight,
        description: description,
        product_name: productsName,
        d_companies_products_types: {
          connect: {
            id: categoryId,
          }
        },
        code: code,
        d_companies_manufacturers: {
          connect: {
            id: manufacturerId,
          }
        }, 
        s_unit_measure: {
          connect: {
            id: measureType,
          }
        }, 
        d_companies_products_price: {
          create: priceArray.map( item => ({
            price: Number(item.price),
            date_start: new Date(),
            d_companies_clients_category: {
              connect: {
                id: item.categoryClient
              }
            }
          })),
        },
      },
      select: {
        id: true,
        weight: true,
        description: true,
        product_name: true,
        code: true,
        s_unit_measure: {
          select: {
            id: true,
            unit_name: true,
          }
        }, 
        d_companies_manufacturers: {
          select: {
            id: true,
            manufacturer_name: true,
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

      if(imgProduct) await fotoPut(data.id, imgProduct); 

      const requestData = {
        id: data.id,
        avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${data.id}`,
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
      return res.status(200).json(requestData);

    }).catch(err => { 
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id клиента или категории не был передан' });
  
};

export default postProducts