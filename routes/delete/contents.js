/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');


/*  컨텐츠 게시글 삭제하기  */
/*  /contents/c_delete  */
router.delete('/:contentsid',  async (req, res, next) => {
  try{
    let c_id = req.params.contentsid;

    let deletecontentsSql =
    `
    DELETE
    FROM cotents
    WHERE id = ?
    `;

    // database 확인
    // 해당 컨텐츠를 스크랩한 것도 함께 삭제
    let deletecotentsscrapsharedSql =
    `
    DELETE
    FROM scrap
    WHERE s_contents_id = ?
    `;

    let Transaction = await db.Transaction( async (connection) => {
      let deletecontentsQuery = await connection.query(deletecontentsSql, [c_id]);
      if(!deletecontentsQuery){
        return next("500");
      }

      let deletecotentsscrapQuery = await connection.query(deletecotentsscrapsharedSql, [c_id]);
      if(!deletecotentsscrapQuery){
        return next("500");
      }
    });

    if(!Transaction){
      return next("500");
    }

		res.status(200).send({
			"message" : "Success"
	 	});

  }catch(err){
  	console.log(err);
    return next("500");
  }
});

module.exports = router;
