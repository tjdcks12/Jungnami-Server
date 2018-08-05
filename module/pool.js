const async = require('async');
const pool = require('../config/dbPool.js');

module.exports = {
  queryParamCnt_None : async (...args) => {
    const query = args[0];
    let result;
    try {
      var connection = await pool.getConnection();
      result = await connection.query(query);
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
    }
    finally {
      pool.releaseConnection(connection);
      return result;
    }
  },
  queryParamCnt_Arr : async (...args) => {
    const query = args[0];
    const data = args[1];

    let result;
    try {
      var connection = await pool.getConnection();
      result = await connection.query(query, data);
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
    }
    finally {
      pool.releaseConnection(connection);
      console.log(result);
      return result;
    }
  },
  Transaction : async (...args) => {
    let result;

    try{
      var connection = await pool.getConnection();
      await connection.beginTransaction();

      await args[0](connection, ...args);
      await connection.commit();
    }
    catch(err){
      await connection.rollback();
      console.log("mysql error! err log =>" + err);
    }
    finally {
      pool.releaseConnection(connection);
      return "Success";
    }
  }
};


/* Transaction 사용 예시

const db = require('../module/pool.js');

await db.Transaction( async (connection) => {
  await connection.query(query1, [data]);
  await connection.query(query2, [data]);
})


let Transaction = await db.Transaction( async (connection) => {
  var result_addvote = await connection.query(select_addvote,[vote, id]);
  if(!result_addvote){
    return next("500");
  }

  let result_subcoin = await connection.query(select_subcoin,[vote, id]);
  if(!result_subcoin){
    return next("500");
  }
})

if(!Transaction){
  return next("500");
}

*/
