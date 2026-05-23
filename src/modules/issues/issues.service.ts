import { pool } from "../../db";
import type { IIssues } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssues) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(
        title,
        description,
        type,
        status,
        reporter_id
        )VALUES($1,$2,$3,$4,$5)
        RETURNING *
        `,
    [title, description, type, status, reporter_id],
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
    title: string;
    description: string;
    type: "bug" | "feature_request";
  },
  id: string,
) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
    UPDATE issues SET title=COALESCE($1, title),
     description=COALESCE($2, description),
      type=COALESCE($3, type)
      WHERE id=$4 RETURNING *
    `,
    [title, description, type, id],
  );
  return result;
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
