import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class DataRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteBase() {
    console.log('sql base delete');
    const table = await this.dataSource.query(
      'TRUNCATE user_entity,blog_entity,post_entity,comment_entity,' +
        ' reaction_entity,device_entity,user_confirmation_info_entity,' +
        ' user_recovery_password_info_entity',
    );
    return;
  }
}
