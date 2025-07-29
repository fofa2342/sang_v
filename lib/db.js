// db.js
var mysql = require('mysql2');
var connection = mysql.createConnection({
    host: 'mysql-379394df-agriculture333.i.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_nq8-mjrUO_LsAcSVRVm',
    database: 'defaultdb',
    multipleStatements: true,
    port: 11854
});



connection.connect(function (error) {
    if (!!error) {
        console.log('erreur lors de la connexion à la bd')
        console.log(error)
    } else {
        console.log('connexion établie avec la base de données..!')
    }
})

module.exports = connection;
