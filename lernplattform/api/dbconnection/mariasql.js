const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    port : 3306,
    user: "hans",
    password: "",
    database: "userdb"
});

con.connect();

exports.getCon = function () {
    return con;
}
