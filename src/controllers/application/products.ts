import { Request, Response } from 'express'
import prisma from '../../../prisma' 

const statistics = (req: Request, res: Response) => {
  const id = String(req.query.id);
  if (id) {
    prisma.d_clients_application_products.findMany({
      where: {
        d_clients_application_id: id 
      },
      include: {
        d_companies_clients_category: false,
        d_clients_application: false,
        d_clients_application_pay_detail: false,
        d_companies_products: {
          select: {
            id: true
          }
        }
      }
    }).then((data) => {
        const requestData = data?.map(item => ({
          id: item.id,
          avatarProduct: `http://${res.req?.headers.host}/api/img/product/?id_img=${item.d_companies_products.id}`,
          productName: item.product_name,
          count: item.count_product,
          total: item.total
        }))
        return res.status(200).json(requestData);
    }).catch((err) => {
        res.status(500).send({ message: err.message || "Error" });
    });
  }
  else return res.status(400).json({ message: 'Один из входных данных не заполнен' });
}

type paysType = {
  sum_pay: number;
}

export default statistics