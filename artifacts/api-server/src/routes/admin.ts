import { Router } from "express";
import { db } from "@workspace/db";
import { candidatesTable, votesTable, adminSettingsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function getAdminPassword(): Promise<string> {
  const setting = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, "admin_password")).limit(1);
  if (setting.length === 0) {
    const defaultHash = hashPassword("admin123");
    await db.insert(adminSettingsTable).values({ key: "admin_password", value: defaultHash });
    return defaultHash;
  }
  return setting[0].value;
}

async function getSurveyClosed(): Promise<boolean> {
  const setting = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, "survey_closed")).limit(1);
  return setting.length > 0 && setting[0].value === "true";
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

let activeTokens: Set<string> = new Set();

function verifyToken(req: any): boolean {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return false;
  return activeTokens.has(auth.slice(7));
}

function buildCandidateStats(candidates: any[], allVotes: any[], totalVotes: number) {
  return candidates.map((c) => {
    const candidateVotes = allVotes.filter((v) => v.candidateId === c.id);
    const anonymousVotes = candidateVotes.filter((v) => !v.voterName).length;
    const namedVotersList = candidateVotes
      .filter((v) => v.voterName)
      .map((v) => ({ id: v.id, voterName: v.voterName as string, createdAt: v.createdAt.toISOString() }));
    const recentVotes = candidateVotes.slice(0, 5).map((v) => ({
      id: v.id,
      voterName: v.voterName,
      createdAt: v.createdAt.toISOString(),
    }));

    return {
      id: c.id,
      name: c.name,
      photo: c.photo,
      totalVotes: candidateVotes.length,
      percentage: totalVotes > 0 ? Math.round((candidateVotes.length / totalVotes) * 1000) / 10 : 0,
      anonymousVotes,
      namedVotes: namedVotersList.length,
      recentVotes,
      allNamedVoters: namedVotersList,
    };
  });
}

router.post("/admin/login", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: "Password requerido" });
      return;
    }

    const storedHash = await getAdminPassword();
    const inputHash = hashPassword(password);

    if (inputHash !== storedHash) {
      res.status(401).json({ error: "Contrasena incorrecta" });
      return;
    }

    const token = generateToken();
    activeTokens.add(token);
    res.json({ success: true, token });
  } catch (err) {
    req.log.error({ err }, "Error admin login");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/password", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const storedHash = await getAdminPassword();
    const currentHash = hashPassword(currentPassword);

    if (currentHash !== storedHash) {
      res.status(401).json({ error: "Contrasena actual incorrecta" });
      return;
    }

    const newHash = hashPassword(newPassword);
    await db.update(adminSettingsTable).set({ value: newHash }).where(eq(adminSettingsTable.key, "admin_password"));

    res.json({ success: true, message: "Contrasena actualizada" });
  } catch (err) {
    req.log.error({ err }, "Error changing password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/candidates", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const { name, photo } = req.body;
    if (!name || !photo) {
      res.status(400).json({ error: "Nombre y foto son requeridos" });
      return;
    }

    const [candidate] = await db.insert(candidatesTable).values({ name, photo }).returning();
    res.json(candidate);
  } catch (err) {
    req.log.error({ err }, "Error creating candidate");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/candidates/:id", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const id = parseInt(req.params.id);
    const { name, photo } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (photo) updateData.photo = photo;

    const [candidate] = await db.update(candidatesTable).set(updateData).where(eq(candidatesTable.id, id)).returning();

    if (!candidate) {
      res.status(404).json({ error: "Candidato no encontrado" });
      return;
    }

    res.json(candidate);
  } catch (err) {
    req.log.error({ err }, "Error updating candidate");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/candidates/:id", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const id = parseInt(req.params.id);
    await db.delete(votesTable).where(eq(votesTable.candidateId, id));
    await db.delete(candidatesTable).where(eq(candidatesTable.id, id));

    res.json({ success: true, message: "Candidato eliminado" });
  } catch (err) {
    req.log.error({ err }, "Error deleting candidate");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.id);
    const allVotes = await db.select().from(votesTable).orderBy(desc(votesTable.createdAt));
    const surveyClosed = await getSurveyClosed();

    const totalVotes = allVotes.length;
    const candidateStats = buildCandidateStats(candidates, allVotes, totalVotes);

    res.json({
      totalVotes,
      candidateCount: candidates.length,
      surveyClosed,
      candidates: candidateStats,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/survey/close", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const showVoterNames = req.body?.showVoterNames === true;
    const closedAt = new Date().toISOString();

    const upsert = async (key: string, value: string) => {
      const existing = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(adminSettingsTable).set({ value }).where(eq(adminSettingsTable.key, key));
      } else {
        await db.insert(adminSettingsTable).values({ key, value });
      }
    };

    await upsert("survey_closed", "true");
    await upsert("survey_closed_at", closedAt);
    await upsert("show_voter_names", showVoterNames ? "true" : "false");

    res.json({ success: true, message: "Encuesta finalizada y resultados publicados" });
  } catch (err) {
    req.log.error({ err }, "Error closing survey");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/survey/open", async (req, res) => {
  try {
    if (!verifyToken(req)) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const existing = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, "survey_closed")).limit(1);
    if (existing.length > 0) {
      await db.update(adminSettingsTable).set({ value: "false" }).where(eq(adminSettingsTable.key, "survey_closed"));
    }

    res.json({ success: true, message: "Encuesta reactivada" });
  } catch (err) {
    req.log.error({ err }, "Error opening survey");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { getSurveyClosed, buildCandidateStats };
export default router;
