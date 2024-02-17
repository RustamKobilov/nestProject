import {
  BlogPaginationDTO,
  PaginationBloggerBanListDTO,
  PaginationDTO,
  PaginationSqlDTO,
  UserAdminPaginationDTO,
  UserPaginationDTO,
} from './DTO';
import {
  QuestionsPagination,
  QuestionsPaginationDTO,
} from './Qustions/questionDTO';
import { publishedStatusEnum } from './Qustions/questionEnum';
import { GameEntity } from './Quiz/Game.Entity';
import { PaginationGetTopDTO } from './Quiz/gameDTO';
import { BanStatusForAdminPagination } from './Enum';

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
  getUserAdminPaginationValues(query: any): UserAdminPaginationDTO {
    console.log(query.isBanned);
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection === 'asc' ? 1 : -1,
      searchLoginTerm: query.searchLoginTerm,
      searchEmailTerm: query.searchEmailTerm,
      banStatus: query.banStatus || BanStatusForAdminPagination.all,
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
  getTopUserPaginationDTO(query: PaginationGetTopDTO): PaginationGetTopDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sort: query.sort ? query.sort.toString() : 'avgScores desc,sumScore desc',
    };
  },
  getBloggerBanListPaginationValues(query: any): PaginationBloggerBanListDTO {
    return {
      pageNumber: query.pageNumber || 1,
      pageSize: query.pageSize || 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection === 'asc' ? 1 : -1,
      searchLoginTerm: query.searchLoginTerm,
    };
  },
  getBoolean(value: any) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  },
};
