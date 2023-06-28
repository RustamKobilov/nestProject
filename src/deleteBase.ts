import {Controller, Delete, HttpStatus, Res} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './User/User';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './Blog/Blog';
import { Post, PostDocument } from './Post/Post';
import {Response} from "express";

@Controller('testing/all-data')
export class DeleteBase {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}
  @Delete()
  async deleteBase(@Res() res: Response) {
    await this.userModel.deleteMany({});
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
