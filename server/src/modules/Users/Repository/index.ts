import { Request, Response } from "express"
import prisma from "../../../lib/prisma";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from "../Middlewares";

export const register= async(req:Request,res:Response)=>{
    try {
    const { email, password , name} = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered. Please login." });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
    });

    // Return success response
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, email: newUser.email },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: error });
  }
}

export const login = async(req:Request, res:Response)=>{
    
    try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    // 2. Validate password
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const refreshToken = generateRefreshToken(user.id);
    const accessToken = generateAccessToken(user.id);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken',refreshToken, {httpOnly:true, secure:false, maxAge:sevenDays, path:'/'});
    res.cookie('accessToken',accessToken, {httpOnly:true, secure:false, maxAge:sevenDays, path:'/'});

    return res.status(200).json({msg:'Login success'});

  } catch (error) {
    return res.status(500).json({error});
  }
}

export const refreshToken = async(req:Request, res:Response)=>{
 try {
    const { refreshToken } = req.cookies;
    

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // Verify refresh token
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { userId: number };

    // Generate a new access token
    const newAccessToken = generateAccessToken(payload.userId);
    res.cookie('accessToken',newAccessToken, {httpOnly:true, secure:true});
    return res.status(200).json({msg:'Access token generated'});

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }


}


export const test = async(req:Request, res:Response)=>{
  res.status(200).json({msg:'testing api for protected route'});
}