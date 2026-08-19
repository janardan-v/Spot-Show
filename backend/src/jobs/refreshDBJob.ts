import cron from "node-cron";
import { refreshDB } from "../db/refreshDB";

cron.schedule("0 0 */2 * *", async () => {
    await refreshDB();
});