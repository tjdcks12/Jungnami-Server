/*  의원 순위  */
/*  /ranking  */

const express = require('express');
const router = express.Router();


// 300명
router.use('/all', require('./all'));

// 300명 -검색
router.use('/all/search', require('./all_search'));

// 정당별
router.use('/party/:p_name', require('./party'));

// 정당별 -검색
router.use('/party/:p_name/search', require('./party_search'));

// 지역별
router.use('/city/:city', require('./city'));

// 지역별 -검색
router.use('/city/:city/search', require('./city_search'));


module.exports = router;
