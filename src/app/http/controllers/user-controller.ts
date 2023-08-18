import { Controller, Post, Res, Body, UsePipes, ValidationPipe, Request, Delete } from '@nestjs/common';
import { CreateUserService } from '@src/app/services/user/create.service';
import { Response } from 'express';
import { CreateUserDto } from '../dto/user-dto';
import { DeleteAllUsersService } from '@src/app/services/user/delete.service';

@Controller('user')
export class UserController {

    constructor(       
        private createUserService: CreateUserService,
        private deleteAllUsersService: DeleteAllUsersService
        ) { }

    @Post('')
    @UsePipes(ValidationPipe)
    public async create(@Body() body: CreateUserDto, @Res() res: Response): Promise<void> {
        try {
            const { user } = await this.createUserService.execute(body);

            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
  

    @Delete('delete')
    deleteAll(@Request() req, res: Response) {
        this.deleteAllUsersService.execute();
        return 
    }
}