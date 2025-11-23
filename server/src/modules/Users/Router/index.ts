import { request, response, Router } from "express";
import { authMiddleware } from "../Middlewares";
import UserController from "../Controller";
const {registerController, loginController, refreshTokenController, testController} = new UserController();
export const userRouter = Router();


userRouter.post('/register',registerController);
userRouter.post('/login',loginController);
userRouter.post('/refreshToken', refreshTokenController);

userRouter.get('/protected', authMiddleware, testController);