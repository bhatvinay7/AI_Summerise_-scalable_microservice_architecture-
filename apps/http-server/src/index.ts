import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
const port = 3001;
import userRouter from "./routers/user.router";
import fileuploadRouter from "./routers/fileupload.router";
import getSessionRouter from "./routers/session.route";
import authRouter from "./routers/authRouter";
const corsOptions = {
  origin: [process.env.NEXT_PUBLIC_FRONTEND_URL!],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use("/user", userRouter);
app.use(authRouter);
app.use("/uploadFile", fileuploadRouter);
app.use("/getUserSessions", getSessionRouter);
app.listen(port,"0.0.0.0", () => {
  console.log(`Server running at `);
});
