const express = require('express');
const {
  getAcademicOverview,
  getSemesterData,
  getStudentEnrollment
} = require('../controllers/academicController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/overview', getAcademicOverview);
router.get('/semester-data', getSemesterData);

// Protected routes
router.use(protect);
router.get('/student-enrollment', authorize('student'), getStudentEnrollment);

module.exports = router;
