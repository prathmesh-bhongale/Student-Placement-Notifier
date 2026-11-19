const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate, validateObjectId } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/studentValidator');

router.use(protect, restrictTo('student'));

router.get('/me', ctrl.getMe);
router.put('/me', validate(updateProfileSchema), ctrl.updateMe);
router.get('/matches', ctrl.getMatches);
router.get('/saved', ctrl.getSaved);
router.get('/applied', ctrl.getApplied);
router.post('/drives/:id/save', validateObjectId(), ctrl.saveDrive);
router.delete('/drives/:id/save', validateObjectId(), ctrl.unsaveDrive);
router.post('/drives/:id/apply', validateObjectId(), ctrl.applyDrive);

module.exports = router;
