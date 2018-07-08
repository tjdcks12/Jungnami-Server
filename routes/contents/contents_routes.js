const express = require('express');
const router = express.Router();

//1. 컨텐츠 탭 메인화면 - ok
router.use('/main', require('./main'));

//3. 컨텐츠 하나 클릭시에 카드뉴스 뿌려주기  - ok
router.use('/cardnews', require('./cardnews'));

//4. 컨텐츠 좋아요
router.use('/like', require('./like'));

//5. 컨텐츠에 달린 댓글리스트 보여주기
router.use('/commentlist', require('./commentlist'));

//6. 컨텐츠에 댓글 작성하기
router.use('/makecomment', require('./makecomment'));

//7. 컨텐츠에 댓글 좋아요
router.use('/likecomment', require('./likecomment'));

//8. 컨텐츠 대댓글 목록 보여주기
router.use('/recommentlist', require('./recommentlist'));

//9. 컨텐츠에 대댓글 달기
router.use('/makerecomment', require('./makerecomment'));

//10. 컨텐츠에 대댓글 좋아요
router.use('/likerecomment', require('./likerecomment'));

//11. 컨텐츠 스크랩
router.use('/scrap', require('./scrap'));


module.exports = router;
