import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: 'postgres://RustamKobilov:OhEbfGVM0NS5@ep-noisy-fire-92553051.eu-central-1.aws.neon.tech/neondb',
  //process.env.SQL_URL,
  synchronize: false,
  ssl: true,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  entities: ['src/**/*.Entity{.ts,.js}'],
});
