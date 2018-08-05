/* KIM JI YEON */
/* legislator의 profile+main image를 insert */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_legislator_img.js');


/* test/insert_legislator_img */
router.post('/', upload.fields([{name : 'profile', maxCount : 1}, {name : 'main', maxCount : 1}]), async(req, res, next) => {

	let l_id = req.body.l_id;
	let profile_img = req.files.profile[0].location;
	let main_img = req.files.main[0].location;

	try {
		let updatesql = "UPDATE legislator SET profile_img_url = ?, main_img_url = ? WHERE id = ?" // 이름+정당 => 아이디 (머릿속으로)
		let updatedata = await db.queryParamCnt_Arr(updatesql, [profile_img, main_img, l_id]);

		if(updatedata == undefined) {

			res.status(204).send({
			"message" : "update error"
			});

			return;
		    
		}

	    res.status(201).send({
	      message : "Insert and Update Data Success"
	    });

	} catch(error) {
		console.log(error);

		res.status(500).send({
	        message : "Internal Server Error"
	      });
	}

});

module.exports = router;
