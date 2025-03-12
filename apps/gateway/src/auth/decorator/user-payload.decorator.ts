import { UserPayloadDto } from '@app/common';
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUserPayload = createParamDecorator<UserPayloadDto>(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const { user } = req;

    if (!user) {
      // Guard 에서 제대로 처리를 못할 가능성이 있는 부분이므로 서버에러로 표현
      throw new InternalServerErrorException('TokenGuard 적용 필요');
    }
    return req.user;
  },
);
