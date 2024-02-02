import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentBanListEntity } from './ParentBanList.Entity';
import { outputModel, PaginationBloggerBanListDTO } from '../DTO';
import { helper } from '../helper';
import {
  SaUserViewModel,
  UserBannedForParentViewModel,
  UserViewModel,
} from '../viewModelDTO';
import { mapObject } from '../mapObject';

export class ParentRepositoryTypeORM {
  constructor(
    @InjectRepository(ParentBanListEntity)
    private readonly parentBanListEntity: Repository<ParentBanListEntity>,
  ) {}
  async addParentBanList(parentBanListEntity: ParentBanListEntity) {
    const addUserParentInBanList = await this.parentBanListEntity.save(
      parentBanListEntity,
    );
    return;
  }
  async deleteUserInParentBanList(parentId: string, userId: string) {
    const qbParentBanList = await this.parentBanListEntity.createQueryBuilder(
      'pBL',
    );
    const deleteOperation = await qbParentBanList
      .delete()
      .where('parentId = :parentId AND userId = :userId', {
        parentId: parentId,
        userId: userId,
      })
      .execute();
    if (deleteOperation.affected !== 1) {
      return false;
    }
    return true;
  }
  async findBanUserAndParentInParentBanList(parentId: string, userId: string) {
    const qbParentBanList = await this.parentBanListEntity.createQueryBuilder(
      'pBL',
    );
    console.log(parentId);
    console.log(userId);
    const parentBanList = await qbParentBanList
      .where('pBL.parentId = :parentId AND pBL.userId = :userId', {
        parentId: parentId,
        userId: userId,
      })
      .getOne();
    if (!parentBanList) {
      return false;
    }
    return true;
  }
  async findBanUserInParentBanList(parentId: string) {
    const qbParentBanList = await this.parentBanListEntity.createQueryBuilder(
      'pBL',
    );
    console.log(parentId);
    const parentBanList = await qbParentBanList
      .where('pBL.parentId = :parentId', {
        parentId: parentId,
      })
      .getOne();
    if (!parentBanList) {
      return false;
    }
    return true;
  }
  getFilterGetUsers(paginationUser: PaginationBloggerBanListDTO): any | null {
    if (paginationUser.searchLoginTerm != null) {
      const loginTerm = paginationUser.searchLoginTerm.toLowerCase();
      return {
        where: 'pBL.login ilike :loginTerm',
        params: { loginTerm: `%${loginTerm}%` },
      };
      //return ' WHERE LOWER("login") LIKE ' + "'%" + loginTerm + "%'";
    }
    return {
      where: '',
      params: {},
    };
  }
  async getAllUserForParent(
    pagination: PaginationBloggerBanListDTO,
    parentId: string,
  ): Promise<outputModel<UserBannedForParentViewModel>> {
    const filter = this.getFilterGetUsers(pagination);
    pagination.sortBy =
      pagination.sortBy === 'login' ? 'userLogin' : pagination.sortBy;
    const qbParentBanList = await this.parentBanListEntity.createQueryBuilder(
      'pBL',
    );
    console.log(filter);
    const totalCountUser = await qbParentBanList
      .where(filter.where, filter.params)
      .andWhere('pBL.parentId = :parentId', {
        parentId: parentId,
      })
      .getCount();
    console.log(totalCountUser);
    const sortDirection = pagination.sortDirection === 1 ? 'ASC' : 'DESC';
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        totalCountUser,
      );
    console.log(pagination.sortBy);
    const zaprosQb = await qbParentBanList
      .where(filter.where, filter.params)
      .andWhere('pBL.parentId = :parentId', {
        parentId: parentId,
      })
      .orderBy('pBL.' + pagination.sortBy, sortDirection)
      .limit(pagination.pageSize)
      .offset(paginationFromHelperForUsers.skipPage)
      .getMany();

    const resultUsers = mapObject.mapUserBannedForParent(zaprosQb);

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCountUser,
      items: resultUsers,
    };
  }
}
//parentId, ownerId, userId, userLogin, banReason
