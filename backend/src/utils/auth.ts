import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};