import { Request, Response } from 'express'
import prisma from '../../../prisma' 
import ClientFtp from 'ftp'

const putCompany = async (req: Request, res: Response) => {
  const companyId: string = req.body.companyId;
  const name: string = req.body.name;
  const email: string = req.body.email;
  const phone: string = req.body.phone;
  const contryId: string = req.body.contryId;
  const regionId: string = req.body.regionId;
  const cityId: string = req.body.cityId;
  const street: string = req.body.street;
  const webSite: string = req.body.webSite;
  const inn: string | undefined = req.body.inn;
  const ogrn: string | undefined = req.body.ogrn;
  const imgProduct: string | undefined = req.body.imgProduct;  
  if(companyId && name && email && phone && contryId && regionId && cityId && street && webSite) {
  
    const fotoPut = async (id: string, imgProduct: string) => await new Promise((resolve, reject) => { 
      const clientFtp = new ClientFtp;

      clientFtp.connect({
        host: process.env.FTP_HOST,
        port: Number(process.env.FTP_PORT),
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD
      }); 

      clientFtp.on('ready', () => {
        clientFtp.put(Buffer.from(imgProduct, 'base64'), `./company/avatar/${id}.png`, (err) => {
          if (err) {
            throw err;
          };
          clientFtp.end();
          resolve(true);
        });
      });
    });

    if(imgProduct) await fotoPut(companyId, imgProduct);

    prisma.d_companies.update({
      where: { 
        id: companyId,
      },
      data: {
        companies_name: name,
        email: email,
        inn: inn,
        ogrn: ogrn,
        address: street,
        phone_number1: phone,
        website: webSite,
        s_address_localities: {
          connect: {
            id: cityId, 
          },
          update: {
            s_address_regions: {
              connect: {
                id: regionId,
              },
              update: {
                s_address_countries: {
                  connect: {
                    id: contryId
                  }
                }
              }
            }, 
          }
        }
      },
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
      },
    }).then(data => { 
      const requestData = {
        id: data.id,
        companyImg: `http://${res.req?.headers.host}/api/img/company/?id_img=${data.id}`,
        name: data.companies_name,
        email: data.email,
        phone: data.phone_number1,
        inn: data.inn,
        ogrn: data.ogrn,
        website: data.website, 
        address: {
          countries: {
            value: data.s_address_localities.s_address_regions.s_address_countries.id,
            label: data.s_address_localities.s_address_regions.s_address_countries.country_name
          },
          city: {
            value: data.s_address_localities.id,
            label: data.s_address_localities.locality_name,
          },
          region: {
            value: data.s_address_localities.s_address_regions.id,
            label: data.s_address_localities.s_address_regions.region_name,
          },
          street: data.address,
        },
      }
      res.status(200).send(requestData);

    }).catch(err => { 
      res.status(500).send({ message: err.message || "Error" });
    });

    
  }
  else res.status(400).json({ message: 'Один из обязательных значений не был передан' });
  
};

export default putCompany