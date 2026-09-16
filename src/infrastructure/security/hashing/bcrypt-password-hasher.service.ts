import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptPasswordHasherService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
