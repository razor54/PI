const express = require('express')
const router = express.Router()
const userService = require('../services/userService')()
const favouritesService = require('../services/favouritesService')()
const passport = require('passport')

module.exports = router

router.get('/login', (req, res) => {
    if(req.user)return res.redirect("/")
    res.render('signIn')
})

router.get('/register', (req, res) => {
    res.render('register', {layout: false})
})

router.get('/logout', (req, res) => {
    res.render('logout', {layout: false})
})

router.post('/login', (req, res, next) => {
    userService.authenticate(req.body.username, req.body.password, (err, user, info) => {
        if(err) return next(err)
        if(info) return next(new Error(info))
        req.logIn(user, (err) => {
            if(err) return next(err)
            res.redirect('/')
        })
    })
})

router.post('/logout', (req, res, next) => {
    favouritesService.saveFavourite(req.user, (err, user, info) => {
        if(err) return next(err)
        if(info) return next(new Error(info))
    })
    req.logOut()
    res.redirect('/')
})

router.use((req, res, next) => {
    if(req.user) 
        res.locals.favourites = req.user.favourites
    else res.locals.favourites = []
    next()
})


router.post('/register', (req, res, next) => {
    userService.saveNewUser(req, (err, user, info) => {
        if(err) return next(err)
        if(info) return next(new Error(info))

        userService.authenticate(req.body.username, req.body.password, (err, user, info) => {
            if(err) return next(err)
            if(info) return next(new Error(info))
            req.logIn(user, (err) => {
                if(err) return next(err)
                res.redirect('/')
            })       
        })
    })
})

router.get('/user/profile', (req, res) => {
    if(!req.user)
        res.redirect("/login")
    res.render('profile', req.user)
})

router.use((req, res, next) => {
    if(req.user){
        res.locals.username = req.user.name
    }
    next()
})


passport.serializeUser(function(user, cb) {
    cb(null, user.username)
})
  
passport.deserializeUser(function(username, cb) {
    userService.find(username, cb)
})