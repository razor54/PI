const express = require('express')
const router = express.Router()
const coima = require('../services/coimaService')()

module.exports = router

/*
 * TODO refactor, too many redirections
 */
router.get('/search',(req,res,next)=>{
    res.redirect(`search/${req.query.name}`)

})
router.get('/search/:name', (req, resp, next) => {
    //redirect to page 1
    const first_page = 1
    resp.redirect(`/search/${req.params.name}/page/${first_page}`)
})

router.get('/search/:name/page/:page', (req, resp, next) => {
    coima.getSearch(req.params.name,req.params.page,(err, data) => {
        if(err) return next(err)
        data.user = req.user
        resp.render('movieList', data)
    })
})
router.get('/movies/:id', (req, resp, next) => {
    coima.getMovie(req.params.id, (err, data) => {
        if(err) return next(err)
        resp.render('movieDetails', data)
    })
})
router.get('/actors/:id', (req, resp, next) => {
    coima.getActor(req.params.id, (err, data) => {
        if(err) return next(err)
        resp.render('actorDetails', data)
    })
})

