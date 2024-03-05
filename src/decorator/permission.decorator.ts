import { SetMetadata } from '@nestjs/common'

export const PERMISSION_KEY = 'permission'

export const Permission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions)
