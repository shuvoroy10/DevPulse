import { pool } from "../../db";

const createIssueIntoDB = async (payload: any) => {
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

const getAllIssueFromDB = async()=>{
   const result = await pool.query(`
          SELECT * FROM issues  
            `);
 return result;
}

const getSingleIssuefromDB = async(id: string)=>{
    const result = await pool.query(
      `
          SELECT * FROM issues WHERE id=$1 
            `,
      [id],
    );
    return result
}

export const issuesService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssuefromDB
};
