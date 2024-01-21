import * as argon from 'argon2';
export const argonService = {
  async getHashPassword(password: string): Promise<string> {
    return argon.hash(password);
  },

  async comparePassword(
    inputPassword: string,
    password: string,
  ): Promise<boolean> {
    return argon.verify(password, inputPassword);
    //return true;
  },
};
