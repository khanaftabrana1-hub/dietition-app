import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch, Delete, UnauthorizedException, Headers } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './users.service.js';
import { ForgotPasswordDto } from './entities/forgot-password.dto.js';
import { ResetPasswordDto } from './entities/reset-password.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.usersService.login(loginDto.identifier, loginDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto.identifier);
  }

  @Post('resend-otp')
  async resendOtp(@Body() dto: ForgotPasswordDto) {
    return this.usersService.resendOtp(dto.identifier);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header lazmi hai.');
    }

    const token = authHeader.replace('Bearer ', '');
    return this.usersService.logout(token);
  }
}
