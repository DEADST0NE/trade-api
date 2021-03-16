import { Decimal } from '@prisma/client/runtime';
import { Request, Response } from 'express'
import prisma from '../../../prisma'

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

// interface productType {
//   id: string;
//   avatarProduct: string;
//   code: string,
//   name: string | null;
//   price: priceType[];
//   weight: Decimal | null;
//   description: string | null;
//   categoryId: string;
//   productStatus: number;
//   measure: {
//     value: number;
//     label: string;
//   }
//   manufacturer: {
//     id: string;
//     name: string;
//   }
// } 

const getProducts = (req: Request, res: Response) => {
  const searchText = req.query.searchText ? String(req.query.searchText) : undefined;
  const companyId = req.query.companyId && String(req.query.companyId);
  let categoryId = req.query.categoryId && String(req.query.categoryId);
  const skip = req.query.skip ? Number(req.query.skip) : undefined;
  const take = req.query.take ? Number(req.query.take) : undefined; 
  const manufactureFilter: any = req.query.manufactureFilter?.length ? req.query.manufactureFilter : undefined; 
  const clientCatygoryFilter: any = req.query.clientCatygoryFilter?.length ? req.query.clientCatygoryFilter : undefined; 
  const statusProductFilter: any = req.query.statusProductFilter?.length ? req.query.statusProductFilter : undefined;

  if (companyId && categoryId) { 
    const filterM = manufactureFilter?.length ? manufactureFilter?.map( (item: any) => ({
      id: item,
      d_companies: {
        id: companyId
      }
    })) : [
      {
        id: undefined,
        d_companies: {
          id: companyId
        }
      }
    ]

    const filterCc = clientCatygoryFilter?.length ? clientCatygoryFilter?.map( (item: any) => ({
      id: item,
      d_companies: {
        id: companyId
      }
    })) : [
      {
        id: undefined,
        d_companies: {
          id: companyId
        }
      }
    ]

    if(categoryId === 'all')  categoryId=undefined;

    const productStatusFilterAndSearchFilter = () => {
      if(statusProductFilter?.length) {
        return statusProductFilter.map( (item: number) => ({
          OR: searchText ? [{
            description: { 
              contains: searchText,
              mode: "insensitive"
            }
          },{
            product_name: { 
              contains: searchText,
              mode: "insensitive"
            }
          }] : undefined,
          product_status: Number(item),
        }))
      } else if(searchText) {
        return [{
          description: { 
            contains: searchText,
            mode: "insensitive"
          }
        }, {
          product_name: { 
            contains: searchText,
            mode: "insensitive"
          }
        }]
      } 
      return undefined
    } 
    prisma.d_companies_products.findMany({
      skip: skip,
      take: take, 
      where: {
        OR: productStatusFilterAndSearchFilter(),
        is_remove: false, 
        d_companies_manufacturers: { 
          OR: filterM,
        },
        d_companies_products_price: {
          some: {
            d_companies_clients_category: {
              OR: filterCc
            }
          }
        },
        d_companies_products_types: {
          id: categoryId,
        }, 
      },
      select: {
        id: true,
        weight: true,
        description: true,
        product_name: true,
        code: true,
        product_status: true,
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
    }).then((data) => {
      const requestData: requestDataType<any> = {}; 

      const generateProduct = (product: typeof data[0] ) => ({
        id: product.id,
        avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${product.id}`,
        weight: product.weight,
        description: product.description,
        categoryId: product.d_companies_products_types.id,
        code: product.code,
        productStatus: product.product_status,
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
        },
        manufacturer: {
          id: product.d_companies_manufacturers.id,
          name: product.d_companies_manufacturers.manufacturer_name
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