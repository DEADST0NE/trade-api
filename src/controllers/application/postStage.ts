import { Request, Response } from 'express'
import prisma from '../../../prisma'

const postStage = (req: Request, res: Response) => {

  const applicationId: string = req.body.applicationId;
  const userId: string = req.body.userId;
  const stageId: number = req.body.stageId;
  if (applicationId && userId && stageId) {
    prisma.d_clients_application_routes_stage.create({
      data: {
          d_clients_application: {
              connect: {
                  id: applicationId
              }
          },
          d_user: {
              connect: {
                  id: userId
              }
          },
          s_routes_stage: {
              connect: {
                  id: Number(stageId)
              }
          },
          user_name: '',
          count_day_execution: 0,
          stage_date: new Date(),
          stage_time: new Date()
      }
    }).then(data => {  
      const requestData = {
        applicationId: data.d_clients_application_id,
        stage: data.s_routes_stage_id
      } 
      return res.status(200).send(requestData); 
    }).catch(err => { 
      return res.status(500).send({ message: err.message || "Error" });
    });
  } else res.status(400).send({ message: "Обязательные поля не заполнены" });
};

export default postStage