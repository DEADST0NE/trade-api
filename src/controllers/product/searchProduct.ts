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

const searchProduct = (req: Request, res: Response) => {
  const searchText = String(req.query.searchText);
  let categoryId = req.query.categoryId && String(req.query.categoryId);
  const companyId = req.query.companyId && String(req.query.companyId); 
  const manufactureFilter: string[] | undefined = req.query.manufactureFilter ? JSON.parse(String(req.query.manufactureFilter)) : undefined; 

  if(searchText && companyId && categoryId) {
    if(categoryId === 'all')  categoryId=undefined;
    const www = manufactureFilter?.length ? manufactureFilter?.map( item => ({
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

    prisma.d_companies_products.findMany({
      where: { 
        d_companies_manufacturers: { 
          OR: www,
        },
        d_companies_products_types: {
          id: categoryId
        },
        OR: [{
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
    }).then(data => {
      const requestData: requestDataType<productType> = {};

      const generateProduct = (product: typeof data[0] ) => ({
        id: product.id,
        avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${product.id}`,
        weight: product.weight,
        description: product.description,
        categoryId: product.d_companies_products_types.id,
        code: product.code,
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
      res.status(200).send(requestData);
    }).catch(err => {
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Текст поиска пустое'});
};

export default searchProduct