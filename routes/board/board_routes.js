const express = require('express');
const router = express.Router();

// 1. 게시판 리스트 보여주기
router.use('/boardlist', require('./boardlist'));

//2. 게시판 글 작성 화면 보여주기 
router.use('/post', require('./post'));

//3. 게시판 글 작성 완료 시 
router.use('/postcomplete', require('./postcomplete'));

//4. 게시판 글 좋아요 
router.use('/likeboard', require('./likeboard'));

//5. 게시판 댓글 리스트 보여주기 
router.use('/commentlist', require('./commentlist'));

//6. 게시판에 댓글 달기 
router.use('/makecomment', require('./makecomment'));

//7. 게시판 댓글에 좋아요
router.use('/likecomment', require('./likecomment'));

//8. 게시판에 대댓 리스트 보여주기 
router.use('/recommentlist', require('./recommentlist'));

//9. 게시판에 대댓글 달기
router.use('/makerecomment', require('./makerecomment'));

//10. 게시판에 대댓글 좋아요
router.use('/likerecomment', require('./likerecomment'));


module.exports = router;
