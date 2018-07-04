// 탭 1 

const express = require('express');
const router = express.Router();

// 호감, 비호감 별 순위
router.use('/list', require('./rankinglist'));


module.exports = router;
