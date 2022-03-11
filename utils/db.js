//数据库连接池
const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "cdb-r93jz160.cd.tencentcdb.com",
  user: "root",
  password: "dsy19991030!",
  database: "shololassistant",
  port: "10125",
});

const connection = function (sql, options = []) {
  return new Promise((resovle, reject) => {
    pool.getConnection(function (err, conn) {
      if (err) {
        throw new Error("error in db.js");
      } else {
        conn.query(sql, options, function (err, results) {
          conn.release();
          if (err) {
            reject(err);
          }
          results && resovle(results);
        });
      }
    });
  });
};
module.exports = connection;
