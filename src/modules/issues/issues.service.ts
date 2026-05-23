
import { pool } from "../../db";
import type { IIssues } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssues, userInfo:any) => {
  const { title, description, type, status} = payload;
  const {id}= userInfo
  
  const result = await pool.query(
    `
        INSERT INTO issues(
        title,
        description,
        type,
        status,
        reporter_id
        )VALUES($1,$2,$3,COALESCE($4,'open'),$5)
        RETURNING *
        `,
    [title, description, type, status, id],
  );
  return result;
};

const getAllIssueFromDB = async () => {
  const result = await pool.query(`
          SELECT * FROM issues  
            `);
  return result;
};

const getSingleIssuefromDB = async (id: string) => {
  const result = await pool.query(
    `
          SELECT * FROM issues WHERE id=$1 
            `,
    [id],
  );
  return result;
};


const updateIssueFromDB = async (
  payload: {
    title?: string;
    description?: string;
    type?: "bug" | "feature_request";
  },
  id: string,
  userInfo: any
) => {
  const { title, description, type } = payload;

  if (userInfo.role === "maintainer") {
   const result = await pool.query(`
    UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type)
      WHERE id = $4
      RETURNING *
    `,[title, description, type, id])

    return result;
  }

  if (userInfo.role === "contributor") {
const result = await pool.query(`
  UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type)
      WHERE id = $4
      AND reporter_id = $5
      AND status = 'open'
      RETURNING *
  `,[title, description, type, id, userInfo.id])

    return result;
  }

  throw new Error("Unauthorized Role");
};


const deleteIssueFromDB = async(id: string)=>{
   const result = await pool.query(`
      DELETE from issues WHERE id=$1
      `,[id])
      return result;
}

export const issuesService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssuefromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};
