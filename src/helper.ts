import {
  BlogPaginationDTO,
  PaginationDTO,
  PaginationSqlDTO,
  UserPaginationDTO,
} from './DTO';
import {
  QuestionsPagination,
  QuestionsPaginationDTO,
} from './Qustions/questionDTO';
import { publishedStatusEnum } from './Qustions/questionEnum';
import { GameEntity } from './Game/GameEntity';

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
  getCommentPaginationValues(query: any): PaginationDTO {
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
  getQuestionPaginationDTO(
    query: QuestionsPaginationDTO,
  ): QuestionsPaginationDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
      bodySearchTerm: query.bodySearchTerm || '',
      publishedStatus: query.publishedStatus || publishedStatusEnum.all,
    };
  },
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
  },
  getGamesPaginationDTO(query: PaginationSqlDTO): PaginationSqlDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'pairCreatedDate',
      sortDirection: query.sortDirection || 'desc',
    };
  },
};
