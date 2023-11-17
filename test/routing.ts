const blogController = `/blogs`;
const postController = `/posts`;
const commentController = `/comments`;
const authController = `/auth`;
const usersController = `/users`;
const securityController = `/security/devices`;
const testingController = `/testing`;
const admin = '/sa';

export const endpoints = {
  admin,
  blogController,
  postController,
  commentController,
  authController: {
    registration: `${authController}/registration`,
    registrationEmailResending: `${authController}/registration-email-resending`,
    registrationConfirmation: `${authController}/registration-confirmation`,
    login: `${authController}/login`,
    refreshToken: `${authController}/refresh-token`,
    me: `${authController}/me`,
    logout: `${authController}/logout`,
  },
  usersController,
  securityController,
  testingController: {
    allData: `${testingController}/all-data`,
  },
  //swaggerEndpoint: `/swagger`,
};
