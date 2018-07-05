//커뮤니티 글 작성 화면 
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

/* GET home page. */
router.get('/:user_id',  async (req, res) => {
  try{
  	if(!(req.params.user_id)){
  		res.status(403).send({
  			"message" : "please input user_id"	
  		});

  	}else{
  		let getpostingviewQuery = 'SELECT img_url FROM myjungnami.user where id = ?';
		  let data = await db.queryParamCnt_Arr(getpostingviewQuery, req.params.user_id);

  		res.status(200).send({
  			"message" : "Successfully get posting view",
  			"data" : data
 	 	});

  	}

  	console.log(data);

  }catch(err){
  	console.log(err);
  	res.status(500).send({
  		"message" : "Syntax error"
  	});
  }
});

module.exports = router;
