import { Request, Response } from 'express'
import prisma from '../../../prisma'

interface requestDataType<TValue> {
  [id: string]: TValue;
} 

interface productType {
  id: string;
  avatarProduct: any;
  code: string,
  name: string | null;
  price: {
    id: string,
    count: number
  };
  weight: number | null;
  description: string | null;
  measure: string;
  manufacturer: {
    id: string;
    name: string;
  }
} 

const getProducts = (req: Request, res: Response) => {
  const clientId = req.query.clientId && String(req.query.clientId);
  const skip = req.query.skip ? Number(req.query.skip) : undefined;
  const take = req.query.take ? Number(req.query.take) : undefined; 

  if (clientId) {
    prisma.d_companies_products.findMany({
      skip: skip,
      take: 20, 
      where: { 
        is_remove: false,
        d_companies_products_price: { 
          some: { 
            OR: [
              {
                date_stop: {
                  gt: new Date()
                },
              },
              {
                date_stop: {
                  equals: null
                },
              }
            ],
            d_companies_clients_category: { 
              d_companies_clients: {
                some: {
                  d_clients: {
                    id: clientId
                  }
                }
              }
            }
          }
        }
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
            unit_name: true,
          }
        }, 
        d_companies_products_types: {
          select: {
            id: true,
            type_name: true
          }
        },
        d_companies_products_price: {
          select: {
            price: true,
            d_companies_clients_category: {
              select: {
                id: true
              }
            }
          }
        },
      }
    }).then((data) => {
      const requestData: requestDataType<productType> = {};

      const generateProduct = (product: typeof data[0] ) => ({
        id: product.id,
        avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${product.id}`,
        weight: product.weight,
        description: product.description, 
        code: product.code,
        price: {
          id: product.d_companies_products_price[0].d_companies_clients_category.id,
          count: product.d_companies_products_price[0].price
        },
        name: product.product_name, 
        measure: product.s_unit_measure.unit_name,
        manufacturer: {
          id: product.d_companies_manufacturers.id,
          name: product.d_companies_manufacturers.manufacturer_name,
        }
      }) 

      for (const product of data) {
        requestData[product.id] = generateProduct(product)
      };
      
      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    }); 
  }
  else res.status(400).json({ message: 'Id компании не заполнен' });
}

export default getProducts