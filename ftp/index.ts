import ClientFtp from 'ftp'

const ftp = new ClientFtp();

ftp.connect({
  host: '192.168.35.72',
  port: 25,
  user: 'ftp',
  password: '123'
});

export default ftp;