import { Request, Response } from "express";
import { login, logout, refreshToken, register, test } from "../Repository";

export const registerService = (req:Request,res:Response)=>{
    return register(req,res);
}
export const loginService = (req:Request, res:Response)=>{
    return login(req,res);
}

export const  refreshTokenService = (req:Request,res:Response)=>{
    return refreshToken(req,res);
}

export const logoutService = (req:Request, res:Response)=>{
    return logout(req,res);
}

export const testService= (req:Request, res:Response)=>{
    return test(req,res);
}