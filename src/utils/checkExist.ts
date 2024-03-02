import { Repository } from 'typeorm';
import { ErrorException } from 'src/common/exceptions/error.exceptions.filter';

export const checkExist = <T>(repository: Repository<T>) => {
  return async (
    key: string,
    cond: string,
    condObj: Record<string, any>,
    transformFunc: (res: T[]) => ErrorException | null,
  ) => {
    const many = await repository
      .createQueryBuilder(key)
      .where(cond, condObj)
      .getMany();

    return transformFunc(many);
  };
};
