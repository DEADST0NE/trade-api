import { Request, Response } from 'express'
import prisma from '../../../prisma' 


const getCompany = (req: Request, res: Response) => {
  const userId = req.query.id; 
  if(userId) {
    prisma.d_user.findMany({
      where: {
        id: String(userId)
      },
      select: { 
        d_companies: {
          select: {
            id: true,
            companies_name: true,
            address: true,
            email: true,
            phone_number1: true,
            inn: true,
            ogrn: true,
            website: true,
            s_address_localities: { 
              select: {
                id: true,
                locality_name: true, 
                s_address_regions: {
                  select: {
                    s_address_countries: {
                      select: {
                        id: true,
                        country_name: true,
                      }
                    },
                    id: true,
                    region_name: true,
                  }
                }
              }
            },
          }
        }
        },
    }).then(data => {
      const d_companies = data[0].d_companies;
      const requestData = {
        id: d_companies.id,
        name: d_companies.companies_name,
        email: d_companies.email,
        phone: d_companies.phone_number1,
        inn: d_companies.inn,
        ogrn: d_companies.ogrn,
        website: d_companies.website,
        companyImg: `http://${res.req?.headers.host}/api/img/company/?id_img=${d_companies.id}`, 
        address: {
          countries: {
            value: d_companies.s_address_localities.s_address_regions.s_address_countries.id,
            label: d_companies.s_address_localities.s_address_regions.s_address_countries.country_name
          },
          city: {
            value: d_companies.s_address_localities.id,
            label: d_companies.s_address_localities.locality_name,
          },
          region: {
            value: d_companies.s_address_localities.s_address_regions.id,
            label: d_companies.s_address_localities.s_address_regions.region_name,
          },
          street: d_companies.address,
        },
      }
      res.status(200).send(requestData);
    }).catch(err => {
      res.status(500).send({ message: err.message || "Error" });
    });
  }
  else res.status(400).json({ message: 'Id user не был передан' });
  
};

export default getCompany