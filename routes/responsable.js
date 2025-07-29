var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const { render } = require('ejs');

router.get('/', function (req, res, next) {
    res.render('responsable/dashboard_responsable')
});

router.get('/historique', function (req, res, next) {
    res.render('responsable/responsable_historique')
});

router.get('/plannification', function (req, res, next) {
    res.render('responsable/responsable_planification_collectes')
});

router.get('/statistiques', function (req, res, next) {
    res.render('responsable/responsable_statistiques')
});

router.get('/stock', function (req, res, next) {
    res.render('responsable/responsable_suivi_stocks')
});

module.exports = router;