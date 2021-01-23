import { Request, Response } from 'express'
import ClientFtp from 'ftp' 

const getImgProduct = async (req: Request, res: Response) => {
  const idImg = req.query.id_img && String(req.query.id_img);
  if (idImg) {
    const clientFtp = new ClientFtp;

      clientFtp.connect({
        host: process.env.FTP_HOST,
        port: Number(process.env.FTP_PORT),
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD
      });

      await new Promise((resolve, reject) => { 
        clientFtp.on('ready', () => {
          clientFtp.get(`./company/products/img/${idImg}.png`,(err, stream) => { 
            if (err) { 
              clientFtp.get(`./NaN-img.png`,(err, stream) => { 
                if (err) { 
                  clientFtp.end();
                  return resolve(''); 
                }; 
                stream.pipe(res);
                stream.once('close', () => { clientFtp.end(); }); 
              }); 
              return resolve('');
            };
            stream.pipe(res);
            stream.once('close', () => { clientFtp.end(); }); 
          });
        });
      });
      return res.status(200);
  }
  else res.status(400).json({ message: 'Id компании не заполнен' });
}

export default getImgProduct