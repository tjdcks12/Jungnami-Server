// 의원 관련 routes

const express = require('express');
const router = express.Router();

// 의원 투표하기 (post)
router.use('/voting', require('./voting'));
/*
// 의원계정에 들어가기 (get)
router.use('/page', require('./legislator_page'));

// 후원하기
router.use('/support', require('./support'));

// 항의하기
router.use('/complaint', require('./complaint'));
*/
module.exports = router;
