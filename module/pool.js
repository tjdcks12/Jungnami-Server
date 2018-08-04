const async = require('async');
const pool = require('../config/dbPool.js');

module.exports = {
  queryParamCnt_None : async (...args) => {
    const query = args[0];
    let result;
    try {
      var connection = await pool.getConnection();
      result = await connection.query(query) || null;
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
      next("500");
      return;
    }
    finally {
      pool.releaseConnection(connection);
      return result;
    }
  },
  queryParamCnt_Arr : async (...args) => {
    const query = args[0];
    const data = args[1];
    // console.log("datatatata :::" + data);
    let result;
    try {
      var connection = await pool.getConnection();
      result = await connection.query(query, data) || null;
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
      next("500");
      return;
    }
    finally {
      pool.releaseConnection(connection);
      return result;
    }
  },
  Transaction : async (...args) => {
    let result;

    try{
      var connection = await pool.getConnection();
      await connection.beginTransaction();

      result = await args[0](connection, ...args);
    }
    catch(err){
      await connection.rollback();
      pool.releaseConnection(connection);

      console.log("mysql error! err log =>" + err);
      next("500");
      return;
    }
    finally {
      await connection.commit();
      pool.releaseConnection(connection);
      return result;
    }
  }
};


/* Transaction 사용 예시
const db = require('../module/pool.js');

db.Transaction( async (connection) => {
  await connection.query(query1, [data]);
  await connection.query(query2, [data]);
})
*/

/*
트랜잭션 추가 해야할 사항 check
*/
