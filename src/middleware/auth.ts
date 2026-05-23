
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";
import { pool } from "../db";
const auth = (...roles:any) => {
    
    return async (req: Request, res: Response, next: NextFunction) => {
   try {
     const token = req.headers.authorization;
    if(!token){
        res.status(401).json({
            success: false,
            message:"Unauthorized Access!"
        })
    }
    const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload

    const userData = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `,[decoded.id])

    const user = userData.rows[0]
    if(userData.rows.length === 0){
        res.status(404).json({
            success: false,
            message:"User Not Found!"
        })
    }
if(roles.length && !roles.includes(user.role)){
    res.status(404).json({
            success: false,
            message:"contributor don't have acccess"
        })
}
    req.user = decoded
    next();
   } catch (error) {
    next(error)
   }
  };
};

export default auth