import dotenv from "dotenv";

dotenv.config();

export const serverInit = () => {
  const port = parseInt(process.env.SERVER_PORT || "5001");
  const host = process.env.SERVER_HOST || "localhost";
  
  // Basic auth credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";
  
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  Warning: Using default admin credentials. Please set ADMIN_USERNAME and ADMIN_PASSWORD in .env file');
  }
  
  return {
    port,
    host,
    auth: {
      username: adminUsername,
      password: adminPassword,
      realm: "BullMQ Admin Dashboard"
    }
  };
};  