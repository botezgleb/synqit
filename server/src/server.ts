import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import http from "http";

const PORT = process.env.SERVER_PORT || 3000;

const start = async () => {
  try {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server has been crushed. Error:", error);
  }
};

start();