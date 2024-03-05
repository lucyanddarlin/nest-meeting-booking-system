import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { MAX_PAGE_SIZE, defaultPaginationParams } from 'src/constants/paginate'

export class CustomPaginationMeta {
  constructor(
    public readonly counts: number,
    public readonly currentPage: number,
    public readonly totalCounts: number,
    public readonly totalPages: number,
  ) {}
}

export const getPaginationOptions = (
  page: number = defaultPaginationParams.currentPage,
  size: number = defaultPaginationParams.pageSize,
) => {
  const limit = size > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : size

  const options: IPaginationOptions<CustomPaginationMeta> = {
    page,
    limit,
    metaTransformer(meta): CustomPaginationMeta {
      return new CustomPaginationMeta(
        meta.itemCount,
        meta.currentPage,
        meta.totalItems,
        meta.totalPages,
      )
    },
  }

  return options
}
