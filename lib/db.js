// db.js
var mysql = require('mysql2');
var connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '',
    multipleStatements: true,
    port:
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
