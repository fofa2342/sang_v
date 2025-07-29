function checkRole(requiredRole) {
    return function (req, res, next) {
        // Vérifie si l'utilisateur est connecté
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }
        // Vérifie si le rôle correspond
        if (req.user.role !== requiredRole) {
            return res.status(403).send('Accès refusé : rôle non autorisé.');
        }
        next();
    };
}

module.exports = { checkRole };
