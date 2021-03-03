import { Request, Response } from 'express'
import prisma from '../../../prisma' 

const getClietnDitailProduct = (req: Request, res: Response) => {
  const productId = req.query.productId && String(req.query.productId);
  const categoryClientId = req.query.categoryClientId && String(req.query.categoryClientId); 
  if (productId && categoryClientId) {
    prisma.d_companies_products.findMany({ 
      where: {
        id: productId,
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
        description: true,
        product_name: true,
        code: true,
        d_companies_manufacturers: {
          select: {
            id: true,
            manufacturer_name: true,
            address: true,
            email: true,
            phone_number1: true,
            d_companies: {
              select: {
                id: true,
                companies_name: true,
                phone_number1: true,
                address: true
              }
            }
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
            id: true,
            price: true
          }
        },
      }
    }).then((data) => {  
      const product = data[0];
      const requestData = {
        id: product.id,
        avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${product.id}`,
        weight: product.weight,
        description: product.description, 
        code: product.code,
        price: {
          id: product.d_companies_products_price[0].id,
          count: product.d_companies_products_price[0].price
        }, 
        name: product.product_name, 
        measure: product.s_unit_measure.unit_name,
        manufacturer: {
          id: product.d_companies_manufacturers.id,
          name: product.d_companies_manufacturers.manufacturer_name,
        },
        companyId: product.d_companies_manufacturers.d_companies.id,
        company: {
          name: product.d_companies_manufacturers.d_companies.companies_name,
          phone: product.d_companies_manufacturers.d_companies.phone_number1,
          address: product.d_companies_manufacturers.d_companies.address,
        }
      }
      
      return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    }); 
  }
  else res.status(400).json({ message: 'Id компании не заполнен' });
}

export default getClietnDitailProduct