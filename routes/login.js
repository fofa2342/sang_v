var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // Correction ici
var crypto = require('crypto');
var db = require('../lib/db');

// Affiche le formulaire de login
router.get('/', function (req, res, next) {
    res.render('login/login');
});

// Stratégie d'authentification locale
passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.query('SELECT * FROM dons_sang.users WHERE username = ?', [username], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (!results || results.length === 0) {
            return cb(null, false, { message: 'Incorrect username or password.' });
        }
        const row = results[0]; // Premier résultat

        // Choisissez d'utiliser un globalSalt ou le sel spécifique à l'utilisateur
        // Pour un sel par utilisateur, remplacez 'globalSalt' par 'row.salt'
        const globalSalt = process.env.GLOBAL_SALT || 'SOME_GLOBAL_SALT';
        crypto.pbkdf2(password, globalSalt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) {
                return cb(err);
            }
            // Comparer le mot de passe haché avec la valeur stockée dans la colonne 'password'
            if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {
                return cb(null, false, { message: 'Incorrect username or password.' });
            }
            return cb(null, row);
        });
    });
}));

// Sérialiser l'utilisateur en stockant uniquement l'ID
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user.id);
    });
});

// Désérialiser l'utilisateur en récupérant ses informations depuis la BDD
passport.deserializeUser(function (id, cb) {
    process.nextTick(function () {
        db.query(
            'SELECT id, username, role FROM dons_sang.users WHERE id = ?',
            [id],
            function (err, results) {
                if (err) {
                    return cb(err);
                }
                if (!results || results.length === 0) {
                    // Au lieu de renvoyer une erreur, on retourne null.
                    return cb(null, null);
                }
                return cb(null, results[0]);
            }
        );
    });
});


// Route POST pour l'authentification
router.post('/', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Erreur interne
        }
        if (!user) {
            return res.redirect('/login'); // Auth échouée
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redirection selon le rôle de l'utilisateur
            switch (user.role) {
                case 'ADMIN':
                    return res.redirect('/admin');
                case 'MEDECIN':
                    return res.redirect('/medecin');
                case 'INFIRMIER':
                    return res.redirect('/infirmier');
                case 'TECHNICIEN':
                    return res.redirect('/technicien');
                case 'ASSISTANT':
                    return res.redirect('/assistant');
                case 'RESPONSABLE':
                    return res.redirect('/responsable');
                case 'DONNEUR':
                    return res.redirect('/donneur');
                default:
                    return res.redirect('/');
            }
        });
    })(req, res, next);
});

module.exports = router;
