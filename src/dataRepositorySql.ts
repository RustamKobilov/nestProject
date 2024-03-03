import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class DataRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteBase() {
    console.log('sql base delete');
    const table = await this.dataSource.query(
      'TRUNCATE user_confirmation_info_entity, user_recovery_password_info_entity, user_ban_list_entity, parent_ban_list_entity, blog_image_entity, post_image_entity, user_entity,blog_entity, ' +
        'post_entity,comment_entity,' +
        ' reaction_entity,device_entity,' +
        ' game_entity,' +
        ' question_entity,' +
        ' player_entity',
    );
    return;
  }
}
