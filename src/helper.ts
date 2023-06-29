import { BlogPaginationDTO, PaginationDTO, UserPaginationDTO } from './DTO';

export const helper = {
  getPaginationFunctionSkipSortTotal(
    pageNumber: number,
    pageSize: number,
    countFromDb: number,
  ) {
    return {
      skipPage: (pageNumber - 1) * pageSize,
      totalCount: Math.ceil(countFromDb / pageSize),
    };
  },
  getUserPaginationValues(query: any): UserPaginationDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection === 'asc' ? 1 : -1,
      searchLoginTerm: query.searchLoginTerm,
      searchEmailTerm: query.searchEmailTerm,
    };
  },
  getBlogPaginationValues(query: any): BlogPaginationDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection === 'asc' ? 1 : -1,
      searchNameTerm: query.searchNameTerm,
    };
  },
  getPostPaginationValues(query: any): PaginationDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection === 'asc' ? 1 : -1,
    };
  },
  getValueTrim(value: string): string {
    return value.trim();
  },
};
