const express = require('express');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  enrollClass,
  unenrollClass,
  getClassesBySemester
} = require('../controllers/classController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/by-semester', getClassesBySemester);

// Protected routes
router.use(protect);

router
  .route('/')
  .get(getClasses)
  .post(authorize('teacher', 'admin'), createClass);

router
  .route('/:id')
  .get(getClass)
  .put(authorize('teacher', 'admin'), updateClass)
  .delete(authorize('teacher', 'admin'), deleteClass);

// Student enrollment routes
router.post('/:id/enroll', authorize('student'), enrollClass);
router.post('/:id/unenroll', authorize('student'), unenrollClass);

module.exports = router;
