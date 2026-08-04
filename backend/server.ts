import createServerApplication from "./src/app";
import { createServer } from "node:http";
import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 8000;
    const server = createServer(createServerApplication());
    server.listen(PORT, () => {
      console.log(`Server running on  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with a failure code
  }
};

startServer().then(() => {
  console.log("Server started successfully");
});
