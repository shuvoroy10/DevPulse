import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import config from "./config";
const app: Application = express();
const port = 3000;

app.use(express.json());
const pool = new Pool({
  connectionString:
    config.connection_string,
});

const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(30) UNIQUE NOT NULL,
            password VARCHAR(30) NOT NULL,
            role VARCHAR(30) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};
initDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
  });
});

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password, role, created_at, updated_at } = req.body;
  try {
    const result = await pool.query(
      `
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4)
        RETURNING *
        `,
      [name, email, password, role],
    );

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
});



app.listen(port, () => {
  console.log(`Example app listening on port ${config.port}`);
});
