import ClientFtp from 'ftp'

const clientFtp = new ClientFtp;
      
clientFtp.connect({
  host: process.env.FTP_HOST,
  port: Number(process.env.FTP_PORT),
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD
});

export default clientFtp