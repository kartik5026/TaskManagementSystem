import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
interface AuthRequest extends Request{
    userId?:number
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get access token from cookies
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: number };

    // Attach userId to request
    req.userId = payload.userId;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const generateRefreshToken = (id:number)=>{
   try {
     return jwt.sign({userId:id}, process.env.REFRESH_TOKEN_SECRET!, {expiresIn:'7m'});
   } catch (error) {
     throw error;
   }
}

export const generateAccessToken = (id:number)=>{
    try {
        return jwt.sign({userId:id}, process.env.ACCESS_TOKEN_SECRET!, {expiresIn:'5m'});
    } catch (error) {
        throw error;
    }
}


