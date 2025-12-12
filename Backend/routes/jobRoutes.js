import express from "express";
import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJobApplicants,
  applyToJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { jobValidation, validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes that require HR role for creation, but GET is public for authenticated users
router
  .route("/")
  .get(getAllJobs) // Allow all authenticated users to view jobs
  .post(authorizeRoles("hr"), jobValidation, validate, createJob); // Only HR can create

router.get("/search", authorizeRoles("hr"), searchJobs);

router
  .route("/:id")
  .get(getJob)
  .put(authorizeRoles("hr"), jobValidation, validate, updateJob)
  .delete(authorizeRoles("hr"), deleteJob);

// Apply to a job (employees only)
router.post("/:id/apply", authorizeRoles("employee", "user"), applyToJob);

router.get("/:id/applicants", authorizeRoles("hr"), getJobApplicants);

export default router;
