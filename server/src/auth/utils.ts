import * as crypto from 'crypto';

export const hashPassword = (password: string): string => {
  const hmac = crypto.createHmac(
    'sha256',
    process.env.HMAC_SECRET_HASH_PASSWORD as string,
  );
  hmac.write(password);
  hmac.end();
  return hmac.read().toString('hex');
};
