/*  legislator routes  */

const express = require('express');
const router = express.Router();


// 의원 목록 (이름, 정당, 지역구)
router.use('/', require('./legislator'));

// 정당 목록
router.use('/partylist', require('./partylist'));

// 의원계정에 들어가기
router.use('/page', require('./page'));

// 투표하기
router.use('/vote', require('./vote'));

// 후원하기
router.use('/support', require('./support'));

module.exports = router;
