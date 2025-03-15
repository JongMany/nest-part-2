import { Controller } from '@nestjs/common';

import { UserMicroservice } from '@app/common';
import { UserService } from './user.service';

@Controller()
export class UserController implements UserMicroservice.UserServiceController {
  constructor(private readonly userService: UserService) {}

  // @MessagePattern({
  //   cmd: 'get_user_info',
  // })
  // @UseInterceptors(RpcInterceptor)
  // @UsePipes(ValidationPipe)
  // getUserInfo(@Payload() data: GetUserInfoDto) {
  getUserInfo(data: UserMicroservice.GetUserInfoRequest) {
    return this.userService.getUserById(data.userId);
  }
}
