const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const hbs = require('hbs')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')

const index = require('./routes/index')
const coimaRouter = require('./routes/coimaRoutes')
const userRoutes = require('./routes/userRoutes')
const favouriteRoutes = require('./routes/favouritesRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials')

// uncomment after placing your favicon in /public
app.use(bodyParser.urlencoded({ extended: false }))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())



app.use(userRoutes)
app.use('/', index)
app.use(coimaRouter)
app.use(favouriteRoutes)
app.use(commentRoutes)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
