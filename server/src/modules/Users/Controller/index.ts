import { Request, Response } from "express";
import { loginService, logoutService, refreshTokenService, registerService, testService } from "../Services";

class UserController{
    registerController(req:Request,res:Response){
        return registerService(req,res);

    }

    loginController(req:Request,res:Response){
        return loginService(req,res);
    }

    refreshTokenController(req:Request, res:Response){
        return refreshTokenService(req,res);
    }

    logoutController(req:Request, res:Response){
        return logoutService(req,res);
    }

    testController(req:Request, res:Response){
        return testService(req,res);
    }
}
export default UserController;