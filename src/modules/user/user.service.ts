import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

const createUserIntoDB = async(payload: IUser)=>{
    const {name, email, password, role}= payload
    const hashPassword = await bcrypt.hash(password,10)
    const result = await pool.query(
      `
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4)
        RETURNING *
        `,
      [name, email, hashPassword, role],
    );
    delete result.rows[0].password;
    return result;
}

const logInUserIntoDB = async(payload: {email: string; password: string;})=>{
    const {email, password} = payload;

    const userData = await pool.query(`
      SELECT * FROM users WHERE email = $1
      `,[email]) 
      if(userData.rowCount == 0){
        throw new Error("Invalid Crendential!")
      }
      const user = userData.rows[0];
      const matchPassword = await bcrypt.compare(password,user.password)
      
      if(!matchPassword){
        throw new Error("Invalid Crendential!")
      }

      const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      const token = jwt.sign(jwtPayload,config.secret as string,{
        expiresIn: "1d"
      })
      delete user.password
      return {token,user};
}

export const userService = {
    createUserIntoDB,
    logInUserIntoDB
}