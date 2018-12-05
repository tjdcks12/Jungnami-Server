/*  의원 순위  */
/*  /ranking  */

const express = require('express');
const router = express.Router();


// 300명 순위
router.use('/all', require('./all'));

// 정당별 순위
router.use('/party/:p_name', require('./party'));

// 지역별 순위
router.use('/city/:city', require('./city'));

// 의원검색 (이름/정당/지역)
router.use('/search', require('./search'));


module.exports = router;

