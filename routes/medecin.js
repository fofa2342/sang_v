var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const { render } = require('ejs');

router.get('/', function (req, res, next) {
    res.render('medecin/dashboard_medecin')
});

router.get('/donneurs', function (req, res, next) {
    res.render('medecin/medecin_donneurs')
});

router.get('/entretiens', function (req, res, next) {
    res.render('medecin/medecin_entretiens')
});

router.get('/resultats', function (req, res, next) {
    res.render('medecin/medecin_resultats_tests')
});

module.exports = router;