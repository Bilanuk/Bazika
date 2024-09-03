import jwt from 'jsonwebtoken';

export const signJwt = async (payload: any, expiresIn = '1d') => {
  return jwt.sign(payload, process.env.APP_JWT_SECRET, {
    algorithm: 'HS512',
    expiresIn,
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, process.env.APP_JWT_SECRET, {
    algorithms: ['HS512'],
  });
};
