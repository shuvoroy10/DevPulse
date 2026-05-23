import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.createIssueIntoDB(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
};

const getAllIssue = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssueFromDB();
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssuefromDB(id as string);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue Not Found",
      });
    }
    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issuesService.updateIssueFromDB(
      req.body,
      id as string,
      req.user,
    );
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue Not found in database",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issues Updated Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issuesService.deleteIssueFromDB(id as string);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Issue not Found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
