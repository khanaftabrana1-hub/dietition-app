import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Resend } from 'resend';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserSession } from './entities/user-session.entity.js';
import { ResetPasswordDto } from './entities/reset-password.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { getPasswordResetTemplate } from '../common/templates/email.template.js';

@Injectable()
export class UsersService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) { }


  async signup(createUserDto: CreateUserDto) {
    const { firstName, lastName, country, phoneNumber, age, email, password, confirmPassword } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Password aur Confirm Password match nahi ho rahay!');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      throw new BadRequestException('Email ya Phone number pehle se registered hai!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      firstName,
      lastName,
      country,
      countryCode: createUserDto.countryCode,
      phoneNumber,
      age,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    await this.userRepository.save(newUser);
    return { message: 'Account kamyabi se ban gaya hai!', user: newUser };
  }

  async login(identifier: string, pass: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Ghalat email/phone number ya password!');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Ghalat email/phone number ya password!');
    }


    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);


    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);


    const session = this.userSessionRepository.create({
      email: user.email,
      phoneNumber: user.phoneNumber,
      token: accessToken,
      expiresAt: expiresAt,
      user: user,
    });

    await this.userRepository.save(user);
    await this.userSessionRepository.save(session);


    const { password, confirmPassword, ...userWithoutPassword } = user;

    return {
      message: 'Login kamyab ho gaya!',
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }


  async forgotPassword(identifier: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      throw new NotFoundException('Is email ya phone number par koi account mojood nahi hai!');
    }


    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    user.otp = generatedOtp;
    user.otpExpires = expiry;
    await this.userRepository.save(user);

    if (identifier.includes('@')) {
      try {
        const emailHtml = getPasswordResetTemplate(generatedOtp);
        await this.resend.emails.send({
          from: 'onboarding@resend.dev',
          to: user.email,
          subject: 'Password Reset OTP',
          html: emailHtml,
        });
      } catch (error) {
        throw new BadRequestException('Email bhejnay mein masla aya hai, dobara koshish karein.');
      }
    } else {

      console.log(`Sending SMS OTP ${generatedOtp} to: ${user.phoneNumber}`);
    }

    return { message: 'OTP apke email/phone par bhej diya gaya hai!' };
  }

  async resendOtp(identifier: string) {
    return this.forgotPassword(identifier);
  }


  async resetPassword(dto: ResetPasswordDto) {
    const { identifier, otp, new_password, confirmPassword } = dto;


    if (new_password !== confirmPassword) {
      throw new BadRequestException('Naya password aur Confirm Password match nahi ho rahay!');
    }

    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      throw new NotFoundException('User nahi mila!');
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('Ghalat ya expired OTP hai!');
    }


    const isSameAsOld = await bcrypt.compare(new_password, user.password);
    if (isSameAsOld) {
      throw new BadRequestException('Aap purana password dobara istemal nahi kar saktay, baraye meherbani bilkul naya password lagayein!');
    }

    // 4. Naya password hash karein
    const hashedPassword = await bcrypt.hash(new_password, 10);

    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await this.userRepository.save(user);

    await this.userSessionRepository.delete({ user: { id: user.id } });

    return { message: 'Password kamyabi se tabdeel ho gaya hai! Tamam doosri devices se logout kar diya gaya hai.' };
  }

  // --- Update (Patch) User ---
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User nahi mila!');
    }

    // Agar password update ho raha ho toh usay hash kar dein
    if (updateUserDto.password) {
      if (updateUserDto.password !== updateUserDto.confirmPassword) {
        throw new BadRequestException('Password aur Confirm Password match nahi ho rahay!');
      }
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.confirmPassword = updateUserDto.password;
    }

    await this.userRepository.update(id, updateUserDto);
    return { message: 'User profile kamyabi se update ho gayi hai!' };
  }

  // --- Delete User ---
  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User nahi mila!');
    }

    await this.userRepository.delete(id);
    return { message: 'User kamyabi se delete ho gaya hai!' };
  }

  async logout(token: string) {

    const session = await this.userSessionRepository.findOne({ where: { token } });

    if (!session) {
      throw new UnauthorizedException('Session nahi mila ya pehle hi logout ho chuka hai.');
    }

    await this.userSessionRepository.remove(session);

    return {
      message: 'Kamyabi se logout ho gaye hain!',
    };
  }
}