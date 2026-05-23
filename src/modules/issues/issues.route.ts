import { Router } from "express";
import { issuesController } from "./issues.controller";


const route = Router()
export const issuesRoute = route;

route.post('/', issuesController.createIssue)
route.get('/', issuesController.getAllIssue)
