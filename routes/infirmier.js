var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const { render } = require('ejs');

router.get('/', function (req, res, next) {
    res.render('infirmier/dashboard_infirmier')
});

router.get('/distributions', function (req, res, next) {
    res.render('infirmier/infirmier_distribution')
});

router.get('/dons', function (req, res, next) {
    res.render('infirmier/infirmier_dons')
});

router.get('/receveurs', function (req, res, next) {
    res.render('infirmier/infirmier_receveurs')
});

router.get('/stocks', function (req, res, next) {
    res.render('infirmier/infirmier_suivi_stocks')
});

module.exports = router;