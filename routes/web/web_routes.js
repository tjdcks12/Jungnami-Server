/*  웹용 코드  */
/*  /web  */

const express = require('express');
const router = express.Router();


// 300명 의원순위
router.use('/ranking/all', require('./ranking_all'));

// 정당별 의원순위
router.use('/ranking/party/:p_name', require('./ranking_party'));

// 지역별 의원순위
router.use('/ranking/city/:city', require('./ranking_city'));

// 컨텐츠 관련
router.use('/contents', require('./contents'));


module.exports = router;
