const express = require('express');
const router = express.Router();

// 정당 별 호감/비호감 의원 탭에서 검색
router.use('/legislatorparty', require('./legislatorparty'));

// 지역 별 호감/비호감 의원 탭에서 검색
router.use('/legislatorregion', require('./legislatorregion'));

// 게시판에서 검색
router.use('/community', require('./community'));

// 컨텐츠 검색
router.use('/contents', require('./contents'));

// 팔로워 검색
router.use('/follower', require('./follower'));

// 팔로우 검색
router.use('/following', require('./following'));


module.exports = router;
