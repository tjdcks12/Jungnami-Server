// test routes

const express = require('express');
const router = express.Router();

router.use('/test_push', require('./test_push'));
router.use('/test_mysql', require('./test_mysql'));
router.use('/imageupload_test', require('./imageupload_test'));
router.use('/imageupload_contents_test', require('./imageupload_contents_test'));
router.use('/test', require('./test'));


// 국회의원 이미지 삽입
router.use('/insert_legislator_img', require('./insert_legislator_img'));



module.exports = router;
