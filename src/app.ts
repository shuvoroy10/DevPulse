import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
const app: Application = express();
const port = 3000;

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
  });
});

app.use('/api/auth',userRoute)
app.use('/api/auth', userRoute)

export default app;
