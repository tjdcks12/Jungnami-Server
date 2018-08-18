/*  의원 순위  */
/*  /ranking  */

const express = require('express');
const router = express.Router();


// 300명 순위 / 의원 검색
router.use('/all', require('./all'));

// 정당별 순위 / 의원 검색
router.use('/party/:p_name', require('./party'));

// 지역별 순위 / 의원 검색
router.use('/city/:city', require('./city'));


module.exports = router;




// 모두 반영 후 list.js 삭제 해도 됨.