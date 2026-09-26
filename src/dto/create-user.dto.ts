import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password should be atleast 6 characters long' })
  password!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
