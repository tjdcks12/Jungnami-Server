// default module
const express = require('express');
const router = express.Router();

/** 'uri 중간에 params가 있는 코드'에 삽입해야 함. **/
// var router = express.Router({mergeParams : true});


// board
router.use('/board', require('./board/board_routes'));

// Contents
router.use('/contents', require('./contents/contents_routes'));

// legislatorlist
router.use('/legislatorlist', require('./legislatorlist/legislatorlist_routes'));

//ranking
router.use('/ranking', require('./ranking/ranking_routes'));

// Search
router.use('/search', require('./search/search_routes'));

// User
router.use('/user', require('./user/user_routes'));

// Legislator
router.use('/legislator', require('./legislator/legislator_routes'));

// DELETE
router.use('/delete', require('./delete/delete_routes'));

// Test
router.use('/test', require('./test/test_routes'));


module.exports = router;
