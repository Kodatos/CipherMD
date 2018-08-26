import * as crypto from 'crypto';

const magicNumber: Buffer = Buffer.from('43502e4d44');

export const wrongFileError: Error = new Error('Wrong File');
export const wrongPassError: Error = new Error('Wrong Pass');

async function encrypt(data: string, master: string): Promise<Buffer> {
  const iv: Buffer = crypto.randomBytes(16);
  const salt: Buffer = crypto.randomBytes(64);

  const key: Buffer = crypto.pbkdf2Sync(master, salt, 10000, 32, 'sha512');

  const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted: Buffer = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ]);

  const tag: Buffer = cipher.getAuthTag();

  return Buffer.concat([magicNumber, salt, iv, tag, encrypted]);
}

async function decrypt(content: Buffer, master: string): Promise<string> {
  const header: Buffer = content.slice(0, 10);
  if (!header.equals(magicNumber)) throw wrongFileError;

  const salt: Buffer = content.slice(10, 74);
  const iv: Buffer = content.slice(74, 90);
  const tag: Buffer = content.slice(90, 106);
  const payload: Buffer = content.slice(106);

  const key: Buffer = crypto.pbkdf2Sync(master, salt, 10000, 32, 'sha512');

  const decipher: crypto.Decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    iv
  );
  decipher.setAuthTag(tag);
  try {
    return decipher.update(payload, 'binary', 'utf8') + decipher.final('utf8');
  } catch {
    throw wrongPassError;
  }
}

const Cipher = {
  encrypt,
  decrypt,
  wrongFileError,
  wrongPassError
};

export default Cipher;
