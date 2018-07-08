const express = require('express');
const router = express.Router();

//1. 게시판 글 목록 (뉴스피드)
//router.use('/boardlist', require('./boardlist'));

//2. 게시판 글 작성 화면
router.use('/post', require('./post'));

//3. 게시판 글 작성 완료시
router.use('/postcomplete', require('./postcomplete'));

//4. 게시판 글에 좋아요
router.use('/likeboard', require('./likeboard'));

//5. 게시글에 댓글 달기
router.use('/makecomment', require('./makecomment'));

//6. 게시판 글에 달린 댓글리스트 보여주기
router.use('/commentlist', require('./commentlist'));

//7. 게시판 글에 댓글 좋아요
router.use('/likecomment', require('./likecomment'));

//8. 게시판 대댓글 보여주기
router.use('/recommentlist', require('./recommentlist'));

//9. 게시판  대댓글 달기
router.use('/makerecomment', require('./makerecomment'));

//10. 게시판 대댓글 좋아요
router.use('/likerecomment', require('./likerecomment'));



module.exports = router;
