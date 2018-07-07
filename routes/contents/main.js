//컨텐츠 탭 메인화면 cate 별로 뿌러주기 , cate default -> 추천
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.get('/:cate', async (req, res) => {
  try{
  	if(!req.params.cate) {
  		res.status(403).send({
  			"message" : "input contents category"
  		});
  	}
  	else{
  		let getcontentsmainQuery = 'SELECT * FROM myjungnami.contents WHERE category = ?';

	  	let data = await db.queryParamCnt_Arr(getcontentsmainQuery, [req.params.cate]);

  		res.status(200).send({
  			"message" : "Successfully get contents",
  			"data" : data
  		});

  		console.log(data);
  	}
  }catch(err){
  	console.log(err);
  	res.status(500).send({
  		"message" : "Syntax error"
  	});
  }
});

module.exports = router;