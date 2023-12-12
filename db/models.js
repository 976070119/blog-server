const mysql = require('mysql2');

const poolConfig = {
    host: "117.72.41.119",
    user: "root",
    password: "328522",
    port: 3306,
    database: "blog_data",
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
};

const pool = mysql.createPool(poolConfig);

const promisePoolQuery = (sql, val) => {
    return new Promise((resolve) => {
        pool.query(sql, val, (err, results, fields) => {
            const result = {
                status: "ok",
                error: err,
                result: results,
                fields: fields,
            };
            if (err) {
                result.status = "err";
                resolve(result);
            } else {
                resolve(result);
            }
        });
    });
};

const promisePool = {
    query: promisePoolQuery,
};

pool.query("SELECT 1", function (err, results, fields) {
    if (err) {
        console.log(`数据库连接失败:${err}`);
        return;
    }
    console.log("数据库连接成功");
});

module.exports = {
    pool,
    promisePool,
    promisePoolQuery,
};
