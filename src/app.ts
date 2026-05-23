import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
import { issuesRoute } from "./modules/issues/issues.route";
const app: Application = express();

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
  });
});

app.use('/api/auth',userRoute)
app.use('/api/issues',issuesRoute)

export default app;
