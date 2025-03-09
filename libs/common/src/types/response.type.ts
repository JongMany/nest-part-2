enum ResponseStatus {
  success = 'success',
  error = 'error',
}
export type RpcResponse<T> =
  | {
      data: T;
      status: ResponseStatus.success;
    }
  | { status: ResponseStatus.error; data: Error };
