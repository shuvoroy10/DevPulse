import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";


const route = Router()
export const issuesRoute = route;



route.post('/',auth('contributor','maintainer'), issuesController.createIssue)
route.get('/',issuesController.getAllIssue)
route.get('/:id',issuesController.getSingleIssue)
route.patch('/:id',auth('contributor','maintainer'),issuesController.updateIssue)
route.delete('/:id',auth('maintainer'), issuesController.deleteIssue)

