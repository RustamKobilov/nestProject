const blogController = `/blogs`;
const postController = `/posts`;
const commentController = `/comments`;
const authController = `/auth`;
const usersController = `/users`;
const securityController = `/security/devices`;
const testingController = `/testing`;

export const endpoints = {
  blogController,
  postController,
  commentController,
  authController: {
    registration: `${authController}/registration`,
    registrationEmailResending: `${authController}/registration-email-resending`,
    registrationConfirmation: `${authController}/registration-confirmation`,
    login: `${authController}/login`,
    refreshToken: `${authController}/refresh-token`,
  },
  usersController,
  securityController,
  testingController: {
    allData: `${testingController}/all-data`,
  },
  //swaggerEndpoint: `/swagger`,
};
