const express = require('express');
const router = express.Router();

// 정당 목록 조회
router.use('/partylist', require('./partylist'));

// 정당별 호감/비호감 의원 리스트
router.use('/groupbyparty', require('./groupbyparty'));

// 지역별 호감/비호감 의원 리스트
router.use('/groupbyregion', require('./groupbyregion'));



// 정당별 호감/비호감 의원 리스트 for web
router.use('/groupbypartyforweb', require('./groupbypartyforweb'));

// 지역별 호감/비호감 의원 리스트 for web
router.use('/groupbyregionforweb', require('./groupbyregionforweb'));


module.exports = router;
