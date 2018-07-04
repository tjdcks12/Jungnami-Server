// test routes

const express = require('express');
const router = express.Router();

router.use('/test_mysql', require('./test_mysql'));
router.use('/imageupload_test', require('./imageupload_test'));
router.use('/imageupload_contents_test', require('./imageupload_contents_test'));

module.exports = router;
