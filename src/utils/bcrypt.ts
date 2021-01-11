import bcrypt from 'bcrypt';

const compare = (password: string, hash: string) => bcrypt.compare(password, hash);

export { compare };