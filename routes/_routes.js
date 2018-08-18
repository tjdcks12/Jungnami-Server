/** 새로운 url을 반영한 routes.js **/

/** 'url 중간에 params가 있는 코드'에 삽입해야 함. **/
// var router = express.Router({mergeParams : true});


const express = require('express');
const router = express.Router();


// User
router.use('/user', require('./user/_user_routes'));

// Legislator
router.use('/legislator', require('./legislator/legislator_routes'));  // 끝

// Ranking
router.use('/ranking', require('./ranking/ranking_routes'));  // 끝

// Board
router.use('/board', require('./board/_board_routes')); 

// Contents
router.use('/contents', require('./contents/_contents_routes'));

// For Web
router.use('/web', require('./web/web_routes'));  // 끝




// user, board, contents 각각의 routes 는 정리했고 코드 정리는 못했음.

module.exports = router;
