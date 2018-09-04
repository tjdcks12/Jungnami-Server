/*  board routes  */

const express = require('express');
const router = express.Router();

// 게시판 글
router.use('/', require('./board'));

// 게시판 글에 좋아요
router.use('/like', require('./like'));

// 게시판 글에 달린 댓글
router.use('/comment', require('./comment'));

// 게시판 글에 댓글 좋아요
router.use('/comment/like', require('./commentlike'));

// 게시판 댓글에 달린 대댓글
router.use('/recomment', require('./recomment'));

// 게시판 댓글에 대댓글 좋아요
router.use('/recomment/like', require('./recommentlike'));


module.exports = router;
