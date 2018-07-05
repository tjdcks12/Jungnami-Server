// user routes

const express = require('express');
const router = express.Router();

/*
// mypage 
router.use('/mypage', require('./user/mypage'));
*/



// follow 하기
router.use('/follow', require('./user/follow'));
/*
// follower list
router.use('/followerlist', require('./user/followerlist'));

// following list
router.use('/followinglist', require('./user/followinglist'));
*/
module.exports = router;







/*

이종찬
authorization : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODA3NDY1MjM5LCJpYXQiOjE1MzA3NzU1MDQsImV4cCI6MTUzMzM2NzUwNH0.DAXcgbHm4gOaJMTFyQW0KCvs64lUZai6Cc_pi5pKu4Q

강수진
authorization : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nzg5MDMwOTUxLCJpYXQiOjE1MzA3NzQ4MzcsImV4cCI6MTUzMzM2NjgzN30.v8XjlsNe3-eavyKPgupTSPMpuWZbs4sUz_JP7PvQdpU

*/