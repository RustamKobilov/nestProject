import * as bcrypt from 'bcrypt';
export const bcriptService = {
  async getHashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  },
  async getSalt(round: number): Promise<string> {
    return await bcrypt.genSalt(round);
  },
  async comparePassword(
    inputPassword: string,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(inputPassword, password);
  },
};
