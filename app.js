require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
var session = require('express-session');
var { checkRole } = require('./middlewares/roles');
var MySQLStore = require('express-mysql-session')(session);
var db = require('./lib/db');

// Créez le store de sessions avec la configuration de la base
var sessionStore = new MySQLStore({}, db);

var indexRouter = require('./routes/index');
var adminrouter = require('./routes/admin');
var technicienrouter = require('./routes/technicien');
var medecinrouter = require('./routes/medecin');
var infirmierrouter = require('./routes/infirmier');
var donneurrouter = require('./routes/donneur');
var responsablerouter = require('./routes/responsable');
var assistantrouter = require('./routes/assistant');
var loginrouter = require('./routes/login');
var registrationrouter = require('./routes/registration');

var app = express();

// Si vous êtes derrière un proxy en production, décommentez la ligne suivante
// app.set('trust proxy', 1);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  // En production, pensez à activer le flag secure et d'autres options
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/admin', checkRole('ADMIN'), adminrouter);
app.use('/technicien', checkRole('TECHNICIEN'), technicienrouter);
app.use('/medecin', checkRole('MEDECIN'), medecinrouter);
app.use('/infirmier', checkRole('INFIRMIER'), infirmierrouter);
app.use('/donneur', checkRole('DONNEUR'), donneurrouter);
app.use('/responsable', checkRole('RESPONSABLE'), responsablerouter);
app.use('/assistant', checkRole('ASSISTANT'), assistantrouter);
app.use('/login', loginrouter);
app.use('/registration', registrationrouter);

app.use((req, res, next) => {
  if (req.isAuthenticated() && !req.user) {
    req.logout(err => {
      if (err) { return next(err); }
      return res.redirect('/login');
    });
  } else {
    next();
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack); // Ajoute ceci pour voir l'erreur complète
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


app.listen(3003, () => {
  console.log('Server is running on port 3003');
});

module.exports = app;
