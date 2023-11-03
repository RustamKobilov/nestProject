import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './User/User';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './Blog/Blog';
import { Post, PostDocument } from './Post/Post';
import {
  Comment,
  CommentDocument,
  LikesInfo,
  LikesInfoDocument,
} from './Comment/Comment';
import { Device, DeviceDocument } from './Device/Device';
import { Reaction, ReactionDocument } from './Like/Reaction';

export class DataRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,

    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(LikesInfo.name)
    private likesInfoModel: Model<LikesInfoDocument>,
    @InjectModel(Reaction.name)
    private reactionInfoModel: Model<ReactionDocument>,
  ) {}
  async deleteBase() {
    await this.userModel.deleteMany({});
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.deviceModel.deleteMany({});
    await this.likesInfoModel.deleteMany({});
    await this.reactionInfoModel.deleteMany({});
    return;
  }
}