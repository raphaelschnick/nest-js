import {Controller, Get, Param, ParseIntPipe} from "@nestjs/common";
import {UserService} from "./user.service";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get()
    getList() {
        return this.userService.getList()
    }

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number){
        return this.userService.getById(id)
    }
}
