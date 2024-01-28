import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentBanListEntity } from './ParentBanList.Entity';

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
  async deleteUserInParentBanList(ownerId: string, userId: string) {
    const qbParentBanList = await this.parentBanListEntity.createQueryBuilder(
      'pBL',
    );
    const deleteOperation = await qbParentBanList
      .delete()
      .where('ownerId = :ownerId AND userId = :userId', {
        ownerId: ownerId,
        userId: userId,
      })
      .execute();
    if (deleteOperation.affected !== 1) {
      return false;
    }
    return true;
  }
  async findUserInParentBanList(ownerId: string, userId: string) {
    const qbParentBanList = await this.parentBanListEntity.createQueryBuilder(
      'pBL',
    );
    const parentBanList = await qbParentBanList
      .where('ownerId = :ownerId AND userId = :userId', {
        ownerId: ownerId,
        userId: userId,
      })
      .getOne();
    if (!parentBanList) {
      return false;
    }
    return true;
  }
}
//parentId, ownerId, userId, userLogin, banReason
