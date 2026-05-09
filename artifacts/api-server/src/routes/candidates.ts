import { Router } from "express";
import { db } from "@workspace/db";
import { candidatesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/candidates", async (req, res) => {
  try {
    const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.id);
    res.json(candidates);
  } catch (err) {
    req.log.error({ err }, "Error listing candidates");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
