import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../User/User';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../Blog/Blog';
import { Post, PostDocument } from '../Post/Post';
import { Comment, CommentDocument } from '../Comment/Comment';
import { Device, DeviceDocument } from '../Device/Device';
import { Reaction, ReactionDocument } from '../Like/Reaction';
import { Injectable } from '@nestjs/common';
@Injectable()
export class RepositoryTesting {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Reaction.name)
    private reactionModel: Model<ReactionDocument>,
  ) {}
  async deleteAll() {
    await this.userModel.deleteMany({});
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.deviceModel.deleteMany({});
    await this.reactionModel.deleteMany({});
    return;
  }
}
