import path from "path";
import fs from "fs/promises";
import { getRedisInstance } from "../connections/redis";
import { sendEmailAlert } from "../services/mailer";


const ALERT_THRESHOLD = 5; // 5 for prod
const EXPIRY_SECONDS = 60 * 60 * 24; // 1 hour

export const logAlert = async (
  type: string,
  errorMessage: string,
  alertCount: number
) => {
  // console.log("REDIS INSTANCE HANDSHAKE::-------", await redisInstance.hello())
  try {
    const redisInstance = getRedisInstance();
    const key = `alert:${type}`;
    const count = await redisInstance.incr(key);

    if (count === 1) {
      // set expiry only on first alert
      await redisInstance.expire(key, EXPIRY_SECONDS);
    }

    console.warn(`⚠️ Alert (${type}): ${errorMessage} | Count: ${count}`);
    if (count >= ALERT_THRESHOLD) {
      const templatePath = path.join(__dirname, "../templates/errorAlert.html");
      let mailTemplate = await fs.readFile(templatePath, "utf-8");
      mailTemplate = mailTemplate
        .replace("{{errorMessage}}", errorMessage)
        .replace("{{alertCount}}", String(count));

      const { ALERT_RECEIVER } = process.env;
      if (!ALERT_RECEIVER) {
        throw new Error("ALERT_RECEIVER environment variable is not set");
      }

      await sendEmailAlert({
        to: ALERT_RECEIVER,
        subject: "Biblio Recommend Error Alert",
        html: mailTemplate,
        body: `Alert #${alertCount}: ${errorMessage}`,
      });
    }
  } catch (error) {
    console.error("Error logging alert:", error);
    // throw new Error(`Failed to log alert: ${error}`);
  }
};
