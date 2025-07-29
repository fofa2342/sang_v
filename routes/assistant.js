var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const { render } = require('ejs');

router.get('/', function (req, res, next) {
    res.render('assistant/dashboard_assistant')
});

router.get('/campagnes', function (req, res, next) {
    res.render('assistant/assistant_campagnes_dons')
});

router.get('/ges_donneurs', function (req, res, next) {
    conn.query(
        `
            SELECT 
                u.id AS userId,
                u.username,
                u.nom AS userNom,
                u.prenom AS userPrenom,
                u.email,
                
                dd.telephone,
                dd.adresse,
                dd.id_groupe_sanguin,

                gs.type_groupe,
                gs.rhesus

            FROM dons_sang.users u
            LEFT JOIN dons_sang.donneurs dd 
                ON dd.id_donneur = u.id
            LEFT JOIN dons_sang.groupe_sanguin gs
                ON dd.id_groupe_sanguin = gs.id_groupe
        `,
        (err, rows) => {
            if (err) return next(err);
            res.render('assistant/assistant_gestion_donneurs', { donneurs: rows });
        }
    );
});


// b) Formulaire d'ajout (GET)
// GET: Formulaire d'ajout d'un utilisateur
router.get('/ajouter_utilisateur', async (req, res) => {
    try {
        // Récupérer la liste des groupes sanguins
        const rowsGroups = await query('SELECT * FROM dons_sang.groupe_sanguin');

        res.render('admin/registration', {
            errors: [],
            username: '',
            email: '',
            password: '',
            confirm_password: '',
            nom: '',
            prenom: '',
            role: '',
            sexe: '',
            age: '',
            telephone: '',
            adresse: '',
            id_groupe_sanguin: '',
            groups: rowsGroups
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur interne lors du chargement du formulaire');
    }
});



module.exports = router;