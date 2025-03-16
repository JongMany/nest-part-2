import { Controller, UseInterceptors } from '@nestjs/common';

import { GrpcInterceptor, UserMicroservice } from '@app/common';
import { UserService } from './user.service';

@Controller()
@UseInterceptors(GrpcInterceptor)
@UserMicroservice.UserServiceControllerMethods()
export class UserController implements UserMicroservice.UserServiceController {
  constructor(private readonly userService: UserService) {}

  // @MessagePattern({
  //   cmd: 'get_user_info',
  // })
  // @UseInterceptors(RpcInterceptor)
  // @UsePipes(ValidationPipe)
  // getUserInfo(@Payload() data: GetUserInfoDto) {
  getUserInfo(request: UserMicroservice.GetUserInfoRequest) {
    return this.userService.getUserById(request.userId);
  }
}
