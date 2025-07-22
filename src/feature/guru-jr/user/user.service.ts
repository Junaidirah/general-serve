import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import prisma from '../../../config/db';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(private jwt: JwtService) {}

  async register(data: {
    email: string;
    name?: string;
    password: string;
    schools: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new BadRequestException('Email already used');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        schools: data.schools,
      },
    });

    return { message: 'User created', userId: user.id };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const token = uuidv4();

    await prisma.user.update({
      where: { id: user.id },
      data: { accessToken: token },
    });

    return { accessToken: token };
  }

  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const { password, accessToken, ...safeData } = user;
    return safeData;
  }

  async updateById(
    userId: string,
    updates: Partial<{ name: string; image: string }>,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  }

  async forgotPassword(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, accessToken: null },
    });

    return { message: 'Password updated, please login again' };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { accessToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  async validateToken(token: string) {
    const user = await prisma.user.findFirst({
      where: { accessToken: token },
    });

    if (!user) throw new UnauthorizedException('Invalid token');
    return user;
  }
}
