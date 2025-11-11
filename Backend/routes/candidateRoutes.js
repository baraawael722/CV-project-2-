import express from "express";
import {
  getAllCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  searchCandidates,
  applyForJob,
  updateApplicationStatus,
  calculateMatch,
  uploadResume,
} from "../controllers/candidateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  candidateValidation,
  applicationValidation,
  validate,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

import multer from "multer";
import path from "path";

// Ensure upload destination exists
import fs from "fs";
const uploadDir = path.join(process.cwd(), "uploads", "resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uid = req.user && (req.user._id || req.user.id) ? (req.user._id || req.user.id) : Date.now();
    cb(null, `${uid}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// All routes require authentication
router.use(protect);

router
  .route("/")
  .get(authorizeRoles("hr"), getAllCandidates)
  .post(candidateValidation, validate, createCandidate);

router.get("/search", authorizeRoles("hr"), searchCandidates);

router.post("/apply", applicationValidation, validate, applyForJob);

router.put(
  "/application/status",
  authorizeRoles("hr"),
  updateApplicationStatus
);

router.post("/match", authorizeRoles("hr"), calculateMatch);

// Employee resume upload (multipart/form-data) -> field name: cv
router.post("/upload", authorizeRoles("employee"), upload.single("cv"), uploadResume);

router
  .route("/:id")
  .get(getCandidate)
  .put(candidateValidation, validate, updateCandidate)
  .delete(deleteCandidate);

export default router;
