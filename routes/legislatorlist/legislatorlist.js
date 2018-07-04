/* 정당별 호감/비호감 의원 리스트 */
/*  /legislatorlist/legislatorlist */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

router.get('/:islike/:p_name', async(req, res, next) => {
  var cnt; // 의석 수
  const time = new Date();
  var data = []; // 응답할 데이터

  // 의석 수 가져오기
  let select_partycnt = "SELECT count(*) as cnt FROM legislator where l_party_name = ?";
  let result_partycnt = await db.queryParamCnt_Arr(select_partycnt,[req.params.p_name]);
  cnt = result_partycnt[0].cnt;

  //의원정보 가져오기
  let select_legislator = "SELECT name, region_city, region_state, rank FROM legislator "
  select_legislator += "INNER JOIN (SELECT @rownum:=0) AS R "
  select_legislator += "LEFT JOIN (SELECT (@rownum:=@rownum+1) as rank, lv_legislator_id, count(*) as score "
  select_legislator += "FROM legislatorVote WHERE islike = ? GROUP BY lv_legislator_id) as lv "
  select_legislator += "ON legislator.id = lv.lv_legislator_id where legislator.l_party_name = ? ORDER BY lv.rank DESC";

  let result_legislator = await db.queryParamCnt_Arr(select_legislator,[req.params.islike, req.params.p_name]);
  console.log(result_legislator.length);

  res.status(200).json({
    data : {
      cnt : cnt,
      legislator : result_legislator
    },
    message : "Success",
    status : 200
  });
});

module.exports = router;
