const express = require('express');
const router = express.Router();

// 정당 목록 조회
router.use('/partylist', require('./partylist'));

// 정당별 호감/비호감 의원 리스트
router.use('/legislatorlist', require('./legislatorlist'));

// 지역별 호감/비호감 의원 리스트
router.use('/region', require('./region'));

module.exports = router;
