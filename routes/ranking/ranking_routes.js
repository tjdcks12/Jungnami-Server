const express = require('express');
const router = express.Router();

router.use('/like', require('./likelist'));
router.use('/unlike', require('./unlikelist'));
router.use('/voting', require('./voting'));

module.exports = router;
