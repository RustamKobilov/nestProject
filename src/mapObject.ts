import { User } from './User/User';
import { BlogViewModel, PostViewModel, UserViewModel } from './viewModelDTO';
import { Blog } from './Blog/Blog';
import { Post } from './Post/Post';
import { Reaction } from './Like/Reaction';

export const mapObject = {
  async mapUserForViewModel(user: User): Promise<UserViewModel> {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
  async mapBlogForViewModel(blog: Blog): Promise<BlogViewModel> {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  },
  async mapPost(post: Post): Promise<PostViewModel> {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: post.extendedLikesInfo,
    };
  },
  async mapNewestLikes(reaction: Reaction) {
    return {
      addedAt: reaction.createdAt,
      userId: reaction.userId,
      login: reaction.userLogin,
    };
  },
};
