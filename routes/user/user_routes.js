// user routes

const express = require('express');
const router = express.Router();


// mypage
router.use('/mypage', require('./mypage'));

// mypage 수정하기
router.use('/editprofile', require('./editprofile'));


// kakao login
router.use('/kakaologin', require('./kakaologin'))

// facebook login
router.use('/facebooklogin', require('./facebooklogin'))

// follow 하기
router.use('/follow', require('./follow'));

// unfollow 하기
router.use('/unfollow', require('./unfollow'));

// follower list
router.use('/followerlist', require('./followerlist'));

// following list
router.use('/followinglist', require('./followinglist'));

// 코인 충전 페이지
router.use('/coin', require('./coin'));

// 투표권 충전 페이지
router.use('/vote', require('./vote'));

// 코인 충전 하기
router.use('/addcoin', require('./addcoin'));

// 투표권 충전 하기
router.use('/addvote', require('./addvote'));

// 푸시 알림창 띄우기
router.use('/push', require('./push'));



module.exports = router;




/*

이종찬 807465239
authorization :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODA3NDY1MjM5LCJpYXQiOjE1MzA3NzU1MDQsImV4cCI6MTUzMzM2NzUwNH0.DAXcgbHm4gOaJMTFyQW0KCvs64lUZai6Cc_pi5pKu4Q

강수진 789030951
authorization :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nzg5MDMwOTUxLCJpYXQiOjE1MzA3NzQ4MzcsImV4cCI6MTUzMzM2NjgzN30.v8XjlsNe3-eavyKPgupTSPMpuWZbs4sUz_JP7PvQdpU

임수영 407144669799202
authorization :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQwNzE0NDY2OTc5OTIwMiIsImlhdCI6MTUzMDg3OTYyMiwiZXhwIjoxNTMzNDcxNjIyfQ.RzGz94J0nRnv6OvEN_dd9EvVUqRQiPWEMinxDKIpTQk

*/
