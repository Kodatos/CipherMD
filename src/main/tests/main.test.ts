import Cipher from '../cipher';

it('decrypts encrypted data properly', () => {
  const testString = 'aabbcc';
  return Cipher.encrypt(testString, 'master')
    .then(enc => {
      return Cipher.decrypt(enc, 'master');
    })
    .then(data => {
      expect(data).toBe(testString);
    });
});
