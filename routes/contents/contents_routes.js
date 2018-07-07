const express = require('express');
const router = express.Router();


// 관리자가 컨텐츠 게시할 때
router.use('/post', require('./c_post'));

// 관리자가 컨텐츠 삭제할 때
router.use('/delete', require('./c_delete'));






module.exports = router;
