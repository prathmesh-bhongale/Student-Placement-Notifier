const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate, validateObjectId } = require('../middleware/validate');
const { driveSchema, updateDriveSchema } = require('../validators/driveValidator');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', ctrl.dashboard);
router.get('/drives', ctrl.listDrives);
router.post('/drives', validate(driveSchema), ctrl.createDrive);
router.get('/drives/:id', validateObjectId(), ctrl.getDrive);
router.put('/drives/:id', validateObjectId(), validate(updateDriveSchema), ctrl.updateDrive);
router.delete('/drives/:id', validateObjectId(), ctrl.deleteDrive);
router.post('/drives/:id/notify', validateObjectId(), ctrl.notifyDrive);
router.get('/drives/:id/eligible-students', validateObjectId(), ctrl.eligibleStudents);
router.get('/students', ctrl.listStudents);

module.exports = router;
