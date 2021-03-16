import { Decimal } from '@prisma/client/runtime';
import { Request, Response } from 'express'
import prisma from '../../../prisma'

interface requestDataType<TValue> {
  [id: string]: TValue;
} 

interface productType {
  id: string;
  avatarProduct: string;
  name: string | null;
  price: {
    id: string;
    count: Decimal;
  };
  weight: Decimal | null;
  measure: string; 
} 

const getClientDitailProductOther = (req: Request, res: Response) => {
  const categoryClientId = req.query.categoryClientId && String(req.query.categoryClientId);

  if (categoryClientId) {
    prisma.d_companies_products.findMany({ 
      take: 20,
      where: {
        d_companies_products_price: {
          some: {
            d_companies_clients_category: {
              id: categoryClientId
            } 
          } 
        }
      },
      select: {
        id: true,
        weight: true, 
        product_name: true, 
        s_unit_measure: {
          select: {
            unit_name: true,
          }
        }, 
        d_companies_manufacturers: {
          select: {
            id: true,
            manufacturer_name: true,
            d_companies: {
              select: {
                id: true
              }
            }
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
        companyId: product.d_companies_manufacturers.d_companies.id,
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

export default getClientDitailProductOther