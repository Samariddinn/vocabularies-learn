import { IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @Length(3, 40)
    login: string;

    @IsString()
    @MinLength(8)
    password: string;
}