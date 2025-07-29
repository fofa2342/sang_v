var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const { render } = require('ejs');
const util = require('util');

const query = util.promisify(conn.query).bind(conn);

router.use(express.urlencoded({ extended: true }));

router.get('/', function (req, res, next) {
    res.render('donneur/dashboard_donneur')
});

router.get('/dons', async function (req, res, next) {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT d.id_don, d.date_don, d.type_don, d.volume_ml, d.etat
            FROM dons_sang.don d
            WHERE d.id_user = ?
            ORDER BY d.id_don DESC
        `;

        const dons = await query(sql, [userId]);

        res.render('donneur/mes_dons', { dons });
    } catch (err) {
        console.error(err);
        next(err);
    }
});



router.get('/informations', async function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/login');
        }

        const userId = req.user.id;

        const sql = `
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
            ON dd.nom = u.nom
            AND dd.prenom = u.prenom
          LEFT JOIN dons_sang.groupe_sanguin gs
            ON dd.id_groupe_sanguin = gs.id_groupe

          WHERE u.id = ?
          LIMIT 1
        `;

        // 4) Exécuter la requête
        const rows = await query(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).send('Utilisateur introuvable');
        }

        // 5) Rendre la vue mes_informations avec les infos
        const info = rows[0];
        res.render('donneur/mes_informations', { info });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/informations', async function (req, res, next) {
    try {
        // Récupérer les valeurs du formulaire
        const { nom, prenom, username, email, telephone, adresse } = req.body;
        const userId = req.user.id; // Assurez-vous que l'utilisateur est authentifié

        // Exemple de mise à jour dans la table "users"
        const sqlUser = `
            UPDATE dons_sang.users
            SET nom = ?, prenom = ?, username = ?, email = ?
            WHERE id = ?
        `;
        await query(sqlUser, [nom, prenom, username, email, userId]);

        // Exemple de mise à jour dans la table "donneurs"
        const sqlDonneur = `
            UPDATE dons_sang.donneurs
            SET telephone = ?, adresse = ?
            WHERE nom = ? AND prenom = ?
        `;
        await query(sqlDonneur, [telephone, adresse, nom, prenom]);

        // Rediriger vers la page des informations mises à jour
        res.redirect('/donneur/informations');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router; 