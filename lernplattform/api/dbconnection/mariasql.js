const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    port : 3306,
    user: "root",
    password: "root",
    database: "userdb"
});

con.connect();

exports.getCon = function () {
    return con;
}
