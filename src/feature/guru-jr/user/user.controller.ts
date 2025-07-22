import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../../middleware/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.userService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.userService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.userService.forgotPassword(body.email, body.newPassword);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  update(@Req() req, @Body() body: any) {
    return this.userService.updateById(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Req() req) {
    return this.userService.logout(req.user.id);
  }
}
