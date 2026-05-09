import { Router, type IRouter } from "express";
import healthRouter from "./health";
import candidatesRouter from "./candidates";
import votesRouter from "./votes";
import adminRouter from "./admin";
import resultsRouter from "./results";

const router: IRouter = Router();

router.use(healthRouter);
router.use(candidatesRouter);
router.use(votesRouter);
router.use(adminRouter);
router.use(resultsRouter);

export default router;
