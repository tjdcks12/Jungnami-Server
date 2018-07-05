//커뮤니티 탭 들어오면 메인 화면 -> 페이스북 뉴스피드

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

/* GET home page. */
router.get('/', async (req, res) => {
  try{
  	let getboardlistQuery = 'SELECT * FROM myjungnami.board';

  	let data = await db.queryParamCnt_Arr(getboardlistQuery);

  	res.status(200).send({
  		"message" : "Successfully get boardlist",
  		"data" : data
  	});

  	console.log(data);

  }catch(err){
  	console.log(err);
  	res.status(500).send({
  		"message" : "Syntax error"
  	});
  }
});

module.exports = router;
