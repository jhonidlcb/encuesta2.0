import { Router } from "express";
import { db } from "@workspace/db";
import { votesTable, candidatesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.delete("/votes", async (req, res) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint) {
      res.status(400).json({ error: "fingerprint es requerido" });
      return;
    }

    const existing = await db.select().from(votesTable).where(eq(votesTable.voterFingerprint, fingerprint)).limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "No hay voto registrado para anular" });
      return;
    }

    await db.delete(votesTable).where(eq(votesTable.voterFingerprint, fingerprint));

    res.json({ success: true, message: "Voto anulado. Ya podes votar nuevamente." });
  } catch (err) {
    req.log.error({ err }, "Error canceling vote");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/votes", async (req, res) => {
  try {
    const { candidateId, voterName, fingerprint } = req.body;

    if (!candidateId || !fingerprint) {
      res.status(400).json({ error: "candidateId y fingerprint son requeridos" });
      return;
    }

    const existing = await db.select().from(votesTable).where(eq(votesTable.voterFingerprint, fingerprint)).limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "Ya has emitido tu voto" });
      return;
    }

    const candidate = await db.select().from(candidatesTable).where(eq(candidatesTable.id, candidateId)).limit(1);
    if (candidate.length === 0) {
      res.status(400).json({ error: "Candidato no encontrado" });
      return;
    }

    await db.insert(votesTable).values({
      candidateId,
      voterName: voterName || null,
      voterFingerprint: fingerprint,
    });

    res.json({ success: true, message: "Voto registrado exitosamente" });
  } catch (err) {
    req.log.error({ err }, "Error casting vote");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/votes/check", async (req, res) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint) {
      res.status(400).json({ error: "fingerprint es requerido" });
      return;
    }

    const existing = await db.select().from(votesTable).where(eq(votesTable.voterFingerprint, fingerprint)).limit(1);

    if (existing.length > 0) {
      res.json({ hasVoted: true, candidateId: existing[0].candidateId });
    } else {
      res.json({ hasVoted: false, candidateId: null });
    }
  } catch (err) {
    req.log.error({ err }, "Error checking vote status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
