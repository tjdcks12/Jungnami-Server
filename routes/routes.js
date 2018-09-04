/** 새로운 url을 반영한 routes.js **/

/** 'url 중간에 params가 있는 코드'에 삽입해야 함. **/
// var router = express.Router({mergeParams : true});


const express = require('express');
const router = express.Router();


// User
router.use('/user', require('./user/user_routes'));

// Legislator
router.use('/legislator', require('./legislator/legislator_routes'));

// Ranking
router.use('/ranking', require('./ranking/ranking_routes'));

// Board
router.use('/board', require('./board/board_routes'));

// Contents
router.use('/contents', require('./contents/contents_routes'));

// For Web
router.use('/web', require('./web/web_routes'));



module.exports = router;
