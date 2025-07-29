var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const { render } = require('ejs');

router.get('/', function (req, res, next) {
    res.render('technicien/dashboard_technicien')
});

router.get('/controle_qualite', function (req, res, next) {
    res.render('technicien/technicien_controle_qualite')
});

router.get('/test_resultats', function (req, res, next) {
    res.render('technicien/technicien_tests_resultats')
});

module.exports = router;