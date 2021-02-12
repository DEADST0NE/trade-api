import bcrypt from 'bcrypt';

const compare = (password: string, hash: string) => bcrypt.compare(password, hash);
const hash = (password: string) => bcrypt.hash(password, 10);

export { compare, hash };