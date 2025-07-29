var express = require('express');
var router = express.Router();
var conn = require('../lib/db');   // Connexion à la base de données
var crypto = require('crypto');
var { body, validationResult } = require('express-validator');

// GET: Afficher le formulaire d'inscription
router.get('/', function (req, res, next) {
    // On passe des valeurs par défaut pour éviter les "undefined" dans le formulaire
    res.render('registration_donneur', {
        errors: [],
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        nom: '',
        prenom: '',
        role: ''
    });
});

// POST: Traiter la création du compte
router.post('/',
    [
        body('username')
            .notEmpty().withMessage('Le nom d’utilisateur est requis.'),
        body('email')
            .isEmail().withMessage('Adresse e-mail invalide.'),
        body('password')
            .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
        body('confirm_password')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Les mots de passe ne correspondent pas.'),
        body('nom')
            .notEmpty().withMessage('Le nom est requis.'),
        body('prenom')
            .notEmpty().withMessage('Le prénom est requis.'),
        body('role')
            .notEmpty().withMessage('Le rôle est requis.')
        // Optionnel : on peut vérifier que le rôle correspond à une liste autorisée
        // .isIn(['DONNEUR', 'RECEVEUR', 'ADMIN']).withMessage('Rôle invalide.')
    ],
    function (req, res, next) {
        // Récupérer les erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('registration_donneur', {
                errors: errors.array(),
                username: req.body.username,
                email: req.body.email,
                password: '',
                confirm_password: '',
                nom: req.body.nom,
                prenom: req.body.prenom,
                role: req.body.role
            });
        }

        // Récupérer les données du formulaire, y compris le rôle
        var { username, email, password, nom, prenom, role } = req.body;

        // Vérifier si l'utilisateur ou l'email existe déjà
        conn.query(
            'SELECT id FROM dons_sang.users WHERE username = ? OR email = ?',
            [username, email],
            function (err, results) {
                if (err) {
                    console.error(err);
                    return res.render('registration_donneur', {
                        errors: [{ msg: 'Erreur interne.' }],
                        username,
                        email,
                        password: '',
                        confirm_password: '',
                        nom,
                        prenom,
                        role
                    });
                }

                if (results.length > 0) {
                    // L'utilisateur existe déjà
                    return res.render('registration_donneur', {
                        errors: [{ msg: 'Nom d’utilisateur ou email déjà utilisé.' }],
                        username,
                        email,
                        password: '',
                        confirm_password: '',
                        nom,
                        prenom,
                        role
                    });
                }

                // Hachage du mot de passe (utilisation d'un "global salt" ici)
                const globalSalt = 'SOME_GLOBAL_SALT'; // Stocker cette valeur dans .env en production
                crypto.pbkdf2(password, globalSalt, 310000, 32, 'sha256', function (err, hashedPassword) {
                    if (err) {
                        console.error(err);
                        return res.render('registration_donneur', {
                            errors: [{ msg: 'Erreur lors du hachage du mot de passe.' }],
                            username,
                            email,
                            password: '',
                            confirm_password: '',
                            nom,
                            prenom,
                            role
                        });
                    }

                    // Conversion du Buffer en hexadécimal
                    const finalPassword = hashedPassword.toString('hex');

                    // Insérer le nouvel utilisateur en base
                    conn.query(
                        `INSERT INTO dons_sang.users 
                        (username, email, password, nom, prenom, role, date_creation)
                        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                        [username, email, finalPassword, nom, prenom, role],
                        function (err, insertResult) {
                            if (err) {
                                console.error(err);
                                return res.render('registration_donneur', {
                                    errors: [{ msg: 'Erreur lors de la création du compte.' }],
                                    username,
                                    email,
                                    password: '',
                                    confirm_password: '',
                                    nom,
                                    prenom,
                                    role
                                });
                            }
                            // Tout est OK, on redirige vers la page de login
                            return res.redirect('/login');
                        }
                    );
                });
            }
        );
    }
);

module.exports = router;
