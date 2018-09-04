/*  user routes  */

const express = require('express');
const router = express.Router();


// Kakao Login
router.use('/login/kakao', require('./login_kakao'))

// Mypage
router.use('/mypage', require('./mypage'));

// 나의 Profile
router.use('/profile', require('./profile'));

// Push 알림 띄우기
router.use('/push', require('./push'));

// 정나미 포인트 (get/post)
router.use('/point', require('./point'));

// 투표권 (get/post)
router.use('/vote', require('./vote'));

// 나의 이미지 사진
router.use('/img', require('./img'));

// Contetns Scrap (post/delete)
router.use('/scrap', require('./scrap'));



// Follow (post/delete)
router.use('/follow', require('./follow'));

// f_id의 Follower List 보여주기 / 검색
router.use('/:f_id/followerlist', require('./followerlist'));

// f_id의 Following List 보여주기 / 검색
router.use('/:f_id/followinglist', require('./followinglist'));



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
