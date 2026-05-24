import { pool } from "../../db";
import type { IQuery } from "../../type";
import type { IIssues } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssues, userInfo: any) => {
  const { title, description, type, status } = payload;
  const { id } = userInfo;
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

const getAllIssueFromDB = async (query: IQuery) => {
  const { sort = "newest", type, status } = query;

  const whereClauses: string[] = [];
  const queryValues: string[] = [];

  if (type) {
    queryValues.push(type);
    whereClauses.push(`type = $${queryValues.length}`);
  }

  if (status) {
    queryValues.push(status);
    whereClauses.push(`status = $${queryValues.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const orderDirection = sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query(
    `
    SELECT * FROM issues
    ${whereSql}
    ORDER BY created_at ${orderDirection}
    `,
    queryValues,
  );

  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = issues.map((issue) => issue.reporter_id);

  const uniqueReporterIds = [...new Set(reporterIds)];

  const reportersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [uniqueReporterIds],
  );

  const reporters = reportersResult.rows;

  const formattedIssues = issues.map((issue) => {
    const reporter = reporters.find((user) => user.id === issue.reporter_id);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter: {
        id: reporter?.id,
        name: reporter?.name,
        role: reporter?.role,
      },

      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });

  return formattedIssues;
};

const getSingleIssuefromDB = async (IssueId: string) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    IssueId,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const issue = result.rows[0];

  const reporterRes = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const reporter = reporterRes.rows[0] || null;

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporter
      ? {
          id: reporter.id,
          name: reporter.name,
          role: reporter.role,
        }
      : null,
    created_at: issue.created_at, // Added missing timestamps
    updated_at: issue.updated_at,
  };
};

const updateIssueFromDB = async (
  payload: {
    title?: string;
    description?: string;
    type?: "bug" | "feature_request";
  },
  id: string,
  userInfo: any,
) => {
  const { title, description, type } = payload;

  if (userInfo.role === "maintainer") {
    const result = await pool.query(
      `
    UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type)
      WHERE id = $4
      RETURNING *
    `,
      [title, description, type, id],
    );

    return result;
  }

  if (userInfo.role === "contributor") {
    const result = await pool.query(
      `
  UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type)
      WHERE id = $4
      AND reporter_id = $5
      AND status = 'open'
      RETURNING *
  `,
      [title, description, type, id, userInfo.id],
    );

    return result;
  }

  throw new Error("Unauthorized Role");
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      DELETE from issues WHERE id=$1
      `,
    [id],
  );
  return result;
};

export const issuesService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssuefromDB,
  updateIssueFromDB,
  deleteIssueFromDB,
};
