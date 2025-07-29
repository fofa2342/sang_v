var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
const util = require('util');
const query = util.promisify(conn.query).bind(conn);
var crypto = require('crypto');
var { body, validationResult } = require('express-validator');

// ------------------------------
// 1) Dashboard Admin
// ------------------------------
router.get('/', async (req, res, next) => {
    try {
        // 1. Nombre total de dons
        const rowsTotalDons = await query(`
        SELECT COUNT(*) AS total_dons 
        FROM dons_sang.don
      `);
        const totalDons = rowsTotalDons[0].total_dons;

        // 2. Volume total collecté
        const rowsVolume = await query(`
        SELECT IFNULL(SUM(volume_ml), 0) AS total_volume 
        FROM dons_sang.don
      `);
        const totalVolume = rowsVolume[0].total_volume;

        // 3. Nombre total d’utilisateurs
        const rowsUsers = await query(`
        SELECT COUNT(*) AS total_users 
        FROM dons_sang.users
      `);
        const totalUsers = rowsUsers[0].total_users;

        // 4. Dons en attente (exemple : état "EN_COURS")
        const rowsPending = await query(`
        SELECT COUNT(*) AS dons_en_attente
        FROM dons_sang.don
        WHERE etat = 'EN_COURS'
      `);
        const donsEnAttente = rowsPending[0].dons_en_attente;

        // Vous pouvez ajouter d'autres requêtes ici selon vos besoins.

        // Rendre la vue en passant les statistiques
        res.render('admin/dashboard_admin', {
            totalDons,
            totalVolume,
            totalUsers,
            donsEnAttente
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des statistiques du dashboard :', err);
        return next(err);
    }
});

// ------------------------------
// 2) GESTION DES UTILISATEURS
// ------------------------------

// a) Liste des utilisateurs
router.get('/ges_utilisateurs', function (req, res, next) {
    conn.query('SELECT * FROM dons_sang.users', (err, rows) => {
        if (err) return next(err);
        // Vue : admin/admin_gestion_utilisateurs.ejs
        res.render('admin/admin_gestion_utilisateurs', { users: rows });
    });
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



// c) Traitement d'ajout (POST)
router.post('/ajouter_utilisateur',
    [
        // Validations
        body('username').notEmpty().withMessage('Le nom d’utilisateur est requis.'),
        body('email').isEmail().withMessage('Adresse e-mail invalide.'),
        body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
        body('confirm_password')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Les mots de passe ne correspondent pas.'),
        body('nom').notEmpty().withMessage('Le nom est requis.'),
        body('prenom').notEmpty().withMessage('Le prénom est requis.'),
        body('role').notEmpty().withMessage('Le rôle est requis.'),
        body('sexe').notEmpty().withMessage('Le champ sexe est requis.'),
        body('age').notEmpty().withMessage('Le champ âge est requis.'),
        body('telephone').notEmpty().withMessage('Le champ téléphone est requis.'),
        body('adresse').notEmpty().withMessage('Le champ adresse est requis.')
        // Optionnel : valider id_groupe_sanguin
    ],
    async (req, res) => {
        // 1) Récupération des erreurs
        const errors = validationResult(req);

        // Récupérer la liste des groupes sanguins pour réafficher en cas d’erreur
        let rowsGroups = [];
        try {
            rowsGroups = await query('SELECT * FROM dons_sang.groupe_sanguin');
        } catch (err) {
            console.error('Erreur lors de la récupération des groupes sanguins:', err);
        }

        if (!errors.isEmpty()) {
            // On réaffiche le formulaire avec les erreurs et les champs saisis
            return res.render('admin/registration', {
                errors: errors.array(),
                username: req.body.username,
                email: req.body.email,
                password: '',
                confirm_password: '',
                nom: req.body.nom,
                prenom: req.body.prenom,
                role: req.body.role,
                sexe: req.body.sexe,
                age: req.body.age,
                telephone: req.body.telephone,
                adresse: req.body.adresse,
                id_groupe_sanguin: req.body.id_groupe_sanguin || '',
                groups: rowsGroups
            });
        }

        // 2) Récupération des champs
        let {
            username,
            email,
            password,
            nom,
            prenom,
            role,
            sexe,
            age,
            telephone,
            adresse,
            id_groupe_sanguin
        } = req.body;

        // Valeurs par défaut si vides
        if (!sexe) sexe = 'M';
        if (!age) age = 0;
        if (!telephone) telephone = '';
        if (!adresse) adresse = '';
        if (!id_groupe_sanguin) id_groupe_sanguin = null;

        try {
            // 3) Vérifier si username/email existe déjà
            const rowsCheck = await query(
                'SELECT id FROM dons_sang.users WHERE username=? OR email=?',
                [username, email]
            );
            if (rowsCheck.length > 0) {
                return res.render('admin/registration', {
                    errors: [{ msg: 'Nom d’utilisateur ou email déjà utilisé.' }],
                    username,
                    email,
                    password: '',
                    confirm_password: '',
                    nom,
                    prenom,
                    role,
                    sexe,
                    age,
                    telephone,
                    adresse,
                    id_groupe_sanguin,
                    groups: rowsGroups
                });
            }

            // 4) Hachage du mot de passe
            const globalSalt = 'SOME_GLOBAL_SALT';
            const finalPassword = await new Promise((resolve, reject) => {
                crypto.pbkdf2(password, globalSalt, 310000, 32, 'sha256', (err, hashed) => {
                    if (err) return reject(err);
                    resolve(hashed.toString('hex'));
                });
            });

            // 5) Insertion dans la table users
            const sqlUser = `
          INSERT INTO dons_sang.users
            (username, email, password, nom, prenom, role, date_creation)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
            const resultUser = await query(sqlUser, [username, email, finalPassword, nom, prenom, role]);
            const newUserId = resultUser.insertId;

            // 6) Si c'est un DONNEUR, insérer aussi dans donneurs
            if (role === 'DONNEUR') {
                const sqlDonneur = `
            INSERT INTO dons_sang.donneurs
              (nom, prenom, sexe, age, telephone, adresse, id_groupe_sanguin, date_creation)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `;
                // Remarque : la table donneurs a un id_donneur AUTO_INCREMENT distinct
                // On ne stocke pas l'id de l'utilisateur ici, car la BD ne le prévoit pas
                // (id_donneur != user.id)
                await query(sqlDonneur, [
                    nom,
                    prenom,
                    sexe,
                    age,
                    telephone,
                    adresse,
                    id_groupe_sanguin
                ]);
            }

            // 7) Redirection finale
            return res.redirect('/admin/ges_utilisateurs');
        } catch (err) {
            console.error('Erreur lors de la création du compte:', err);
            // On réaffiche le form avec un message d'erreur générique
            return res.render('admin/registration', {
                errors: [{ msg: 'Erreur interne lors de la création du compte.' }],
                username,
                email,
                password: '',
                confirm_password: '',
                nom,
                prenom,
                role,
                sexe,
                age,
                telephone,
                adresse,
                id_groupe_sanguin,
                groups: rowsGroups
            });
        }
    }
);


// Suppression d'un utilisateur
router.post('/delete_user/:id', function (req, res, next) {
    const userId = req.params.id;
    const sql = 'DELETE FROM dons_sang.users WHERE id = ?';
    conn.query(sql, [userId], (err) => {
        if (err) return next(err);
        res.redirect('/admin/ges_utilisateurs');
    });
});

// Modification d'un utilisateur - Affichage du formulaire
router.get('/edit_user/:id', function (req, res, next) {
    const userId = req.params.id;
    conn.query('SELECT * FROM dons_sang.users WHERE id = ?', [userId], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
            return res.status(404).send('Utilisateur introuvable');
        }
        // Vue : admin/edit_user.ejs
        res.render('admin/edit_user', { user: rows[0] });
    });
});

// Modification d'un utilisateur - Traitement du formulaire
router.post('/edit_user/:id', (req, res) => {
    const userId = req.params.id;
    const { username, email, password, confirm_password, nom, prenom, role } = req.body;

    if (!password) {
        const sql = 'UPDATE dons_sang.users SET username=?, email=?, nom=?, prenom=?, role=? WHERE id=?';
        conn.query(sql, [username, email, nom, prenom, role, userId], (err) => {
            if (err) return res.status(500).send('Erreur lors de la mise à jour');
            return res.redirect('/admin/ges_utilisateurs');
        });
    } else {
        if (password !== confirm_password) {
            return res.send('Les mots de passe ne correspondent pas.');
        }
        const globalSalt = 'SOME_GLOBAL_SALT';
        crypto.pbkdf2(password, globalSalt, 310000, 32, 'sha256', (err, hashedBuffer) => {
            if (err) return res.status(500).send('Erreur de hachage');
            const finalPassword = hashedBuffer.toString('hex');
            const sql = 'UPDATE dons_sang.users SET username=?, email=?, password=?, nom=?, prenom=?, role=? WHERE id=?';
            conn.query(sql, [username, email, finalPassword, nom, prenom, role, userId], (err2) => {
                if (err2) return res.status(500).send('Erreur lors de la mise à jour');
                return res.redirect('/admin/ges_utilisateurs');
            });
        });
    }
});

// ------------------------------
// 3) GESTION DES DONS
// ------------------------------

// Liste des dons
router.get('/ges_dons', (req, res, next) => {
    const sql = `
      SELECT
        d.id_don,
        d.id_user,
        DATE_FORMAT(d.date_don, '%d/%m/%Y %H:%i') AS date_don,
        d.type_don,
        d.volume_ml,
        d.etat,
        u.nom AS donneur_nom,
        u.prenom AS donneur_prenom,

        -- Champs depuis donneurs
        dd.sexe,
        dd.age,
        dd.telephone,
        dd.adresse,

        -- Champs depuis groupe_sanguin
        gs.type_groupe,
        gs.rhesus

      FROM dons_sang.don d
      JOIN dons_sang.users u 
        ON d.id_user = u.id
      -- On suppose que d.id_user = dd.id_donneur
      JOIN dons_sang.donneurs dd
        ON dd.id_donneur = d.id_user
      LEFT JOIN dons_sang.groupe_sanguin gs
        ON dd.id_groupe_sanguin = gs.id_groupe
      ORDER BY d.id_don DESC
    `;
    conn.query(sql, (err, rows) => {
        if (err) return next(err);
        // On envoie tout à la vue admin/admin_gestion_donneurs.ejs
        res.render('admin/admin_gestion_donneurs', { dons: rows });
    });
});

// Ajout d'un don
router.post('/add_don', (req, res, next) => {
    const { id_user, date_don, type_don, volume_ml, etat } = req.body;
    const sql = `
      INSERT INTO dons_sang.don (id_user, date_don, type_don, volume_ml, etat)
      VALUES (?, ?, ?, ?, ?)
    `;
    conn.query(sql, [id_user, date_don, type_don, volume_ml, etat], (err) => {
        if (err) return next(err);
        res.redirect('/admin/ges_dons');
    });
});

// Modification d'un don
router.post('/edit_don/:id', (req, res, next) => {
    const donId = req.params.id;
    let { id_user, date_don, type_don, volume_ml, etat } = req.body;

    // Formatage de la date si besoin
    if (date_don && date_don.trim() !== "") {
        date_don = date_don.replace('T', ' ') + ":00";
    } else {
        date_don = null;
    }

    const sql = `
      UPDATE dons_sang.don 
      SET id_user = ?, date_don = ?, type_don = ?, volume_ml = ?, etat = ? 
      WHERE id_don = ?
    `;
    conn.query(sql, [id_user, date_don, type_don, volume_ml, etat, donId], (err) => {
        if (err) return next(err);
        res.redirect('/admin/ges_dons');
    });
});

// Suppression d'un don
router.post('/delete_don/:id', (req, res, next) => {
    const donId = req.params.id;
    const sql = 'DELETE FROM dons_sang.don WHERE id_don = ?';
    conn.query(sql, [donId], (err) => {
        if (err) return next(err);
        res.redirect('/admin/ges_dons');
    });
});

// ------------------------------
// 4) STATISTIQUES
// ------------------------------
router.get('/statistiques', async (req, res, next) => {
    try {
        // Nombre total de dons
        const rowsTotalDons = await query(`SELECT COUNT(*) AS total_dons FROM dons_sang.don`);
        const totalDons = rowsTotalDons[0].total_dons;

        // Volume total de sang collecté
        const rowsTotalVolume = await query(`SELECT IFNULL(SUM(volume_ml), 0) AS total_volume FROM dons_sang.don`);
        const totalVolume = rowsTotalVolume[0].total_volume;

        // Répartition par type de don
        const rowsTypeRepartition = await query(`
            SELECT type_don, COUNT(*) AS nb
            FROM dons_sang.don
            GROUP BY type_don
        `);

        // Répartition par état
        const rowsEtatRepartition = await query(`
            SELECT etat, COUNT(*) AS nb
            FROM dons_sang.don
            GROUP BY etat
        `);

        // Nombre total d'utilisateurs
        const rowsTotalUsers = await query(`SELECT COUNT(*) AS total_users FROM dons_sang.users`);
        const totalUsers = rowsTotalUsers[0].total_users;

        // Répartition des utilisateurs par rôle
        const rowsUsersByRole = await query(`
            SELECT role, COUNT(*) AS nb
            FROM dons_sang.users
            GROUP BY role
        `);

        // Nouveaux utilisateurs sur les 30 derniers jours
        const rowsNewUsers = await query(`
            SELECT COUNT(*) AS new_users_last_30_days
            FROM dons_sang.users
            WHERE date_creation >= (CURRENT_DATE - INTERVAL 30 DAY)
        `);
        const newUsers = rowsNewUsers[0].new_users_last_30_days;

        // Top 10 donneurs
        const rowsTopDonors = await query(`
            SELECT
              u.id,
              u.username,
              u.nom,
              u.prenom,
              COUNT(d.id_don) AS nb_dons
            FROM dons_sang.users u
            LEFT JOIN dons_sang.don d ON u.id = d.id_user
            WHERE u.role = 'DONNEUR'
            GROUP BY u.id
            ORDER BY nb_dons DESC
            LIMIT 10
        `);

        // Vue : admin/admin_statistiques.ejs
        res.render('admin/admin_statistiques', {
            // Dons
            totalDons,
            totalVolume,
            typeRepartition: rowsTypeRepartition,
            etatRepartition: rowsEtatRepartition,
            // Users
            totalUsers,
            usersByRole: rowsUsersByRole,
            newUsers,
            // Donneurs
            topDonors: rowsTopDonors
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des statistiques :', err);
        return next(err);
    }
});

module.exports = router;
