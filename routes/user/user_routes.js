// user routes

const express = require('express');
const router = express.Router();


// 소셜로그인 하기
router.use('/login', require('./login'));

// mypage 
router.use('/mypage', require('./mypage'));



// follow 하기
router.use('/follow', require('./follow'));

// unfollow 하기
router.use('/unfollow', require('./unfollow'));

// follower list
router.use('/followerlist', require('./followerlist'));

// following list
router.use('/followinglist', require('./followinglist'));

module.exports = router;







/*

이종찬 807465239
authorization : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODA3NDY1MjM5LCJpYXQiOjE1MzA3NzU1MDQsImV4cCI6MTUzMzM2NzUwNH0.DAXcgbHm4gOaJMTFyQW0KCvs64lUZai6Cc_pi5pKu4Q

강수진 789030951
authorization : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nzg5MDMwOTUxLCJpYXQiOjE1MzA3NzQ4MzcsImV4cCI6MTUzMzM2NjgzN30.v8XjlsNe3-eavyKPgupTSPMpuWZbs4sUz_JP7PvQdpU

*/