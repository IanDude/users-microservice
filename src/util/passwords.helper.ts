import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class PasswordUtils {
  async comparePasswords(
    inputPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(storedPassword, inputPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 4096,
      timeCost: 3,
      parallelism: 1,
    });
  }
}
