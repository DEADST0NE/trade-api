import { Request, Response } from 'express'
import prisma from '../../../prisma'
import moment from 'moment'

const getPayments = (req: Request, res: Response) => {
  const applicationId = String(req.query.id);
  if(applicationId) {
    prisma.d_clients_application_pay.findMany({
      where: {
        d_clients_application_id: applicationId
      },
      include: { d_user: true },
      orderBy: { pay_date: "asc" }
    }).then(data => {
      const requestData = data.map(item => (
        { 
          id: item.id,
          number: item.pay_number,
          date: moment(item.pay_date).format('DD.MM.YYYY'),
          count: item.sum_pay,
          employeeName: item.user_name,
          employeeJobPos: item.d_user.job_pos_name
        }
      ))
      res.status(200).send(requestData);
    }).catch(err => {
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Один из входных данных не заполнен' });
  
};

export default getPayments