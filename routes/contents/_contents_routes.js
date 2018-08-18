/*  contents routes  */

const express = require('express');
const router = express.Router();

// 컨텐츠 글 목록
router.use('/', require('./contents'));

// 컨텐츠 글 상세보기
router.use('/detail', require('./detail'));

// 컨텐츠 글에 좋아요
router.use('/like', require('./like'));

// 컨텐츠 글에 달린 댓글
router.use('/comment', require('./comment'));

// 컨텐츠 글에 댓글 좋아요
router.use('/comment/like', require('./commentlike'));


module.exports = router;
