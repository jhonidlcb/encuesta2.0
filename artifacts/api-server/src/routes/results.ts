import { Router } from "express";
import { db } from "@workspace/db";
import { candidatesTable, votesTable, adminSettingsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSurveyClosed, buildCandidateStats } from "./admin";

const router = Router();

router.get("/results", async (req, res) => {
  try {
    const surveyClosed = await getSurveyClosed();
    if (!surveyClosed) {
      res.status(403).json({ error: "La encuesta aun no ha sido cerrada" });
      return;
    }

    const settings = await db.select().from(adminSettingsTable);
    const getSetting = (key: string) => settings.find((s) => s.key === key)?.value ?? null;

    const closedAt = getSetting("survey_closed_at") ?? new Date().toISOString();
    const showVoterNames = getSetting("show_voter_names") === "true";

    const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.id);
    const allVotes = await db.select().from(votesTable).orderBy(desc(votesTable.createdAt));
    const totalVotes = allVotes.length;
    const candidateStats = buildCandidateStats(candidates, allVotes, totalVotes);

    const publicCandidates = showVoterNames
      ? candidateStats
      : candidateStats.map((c) => ({ ...c, allNamedVoters: [] }));

    res.json({
      totalVotes,
      candidateCount: candidates.length,
      closedAt,
      showVoterNames,
      candidates: publicCandidates,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting public results");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
