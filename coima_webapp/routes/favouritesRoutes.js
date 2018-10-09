const favouritesService = require('../services/favouritesService')()
const express = require('express')
const router = express.Router()
module.exports = router


router.use((req, res, next) => {
    if (req.user)
        res.locals.favourites = req.user.favourites
    next()
})

router.delete('/remove/:id_path', (req, res, next) => {

    const user = req.user;
    
    if (!user) return res.redirect('/')


    const favToRemove = user.favourites.filter(e => (e.id_path == req.params.id_path))[0]
    const newFavs = user.favourites.filter(e => (e.id_path != req.params.id_path))
    
    user.favourites = newFavs

    favouritesService.saveFavourite(user, (err) => {
        if (err) return next(err)


        favouritesService.removeList(favToRemove, (err) => {
            if (err) return next(err)
            res.redirect('/')
        })
    })
})

router.delete('/remove/:id_path/:id_movie', (req, res, next) => {

    if (!req.user) return res.redirect('/')

    const aux = req.params.id_path.split('_pg=')

    const user = req.user;
    const id_path = aux[0]
    const page = aux[1]
    const id_movie = req.params.id_movie

    favouritesService.removeMovieFavourites(user, id_path,page,id_movie, (err,list) => {
        if (err) return next(err)

        if(!list){
            return res.redirect(`/favourites/${id_path}/page/${page-1}`)  
           
        }

        favouritesService.lastMovieExchange(user,id_path,page,list,(err)=>{
            if (err) return next(err)
                        
            res.redirect(`/favourites/${id_path}/page/${page}`)            
        })
        
    })
})

router.put('/renameList/:listId/:name', (req, res, next) => {

    if(!req.user) return res.redirect('/')

    favouritesService.changeNames(req.params.listId,req.params.name,req.user, (err, data) => {
        if(err) return next(err)
        res.redirect('/')
    })
})

router.post('/favourites/:id_path', (req, res, next) => {
    if (!req.user) return res.redirect('/')
    const user = req.user
    const id_path = req.params.id_path

    const movie = {
        id: req.body.id,
        title: req.body.title
    }

    favouritesService.addElementToList(user, id_path, movie, (err, page) => {
        if (err) return next(err)
        res.redirect(`/favourites/${id_path}/page/${page}`)
    })
})

router.post('/favourites', (req, res, next) => {
    if (!req.user) return res.redirect('/login')

    res.cookie('id', req.body.id)
    res.cookie('title', req.body.title)

    res.redirect('/favourites/lists/name')
})

router.get('/favourites/lists/name', (req, res, next) => {
    if (!req.user) return res.redirect('/login')
    const data = {}

    data.id = req.cookies.id
    data.title = req.cookies.title
    data.favourites = req.user.favourites

    res.clearCookie('id')
    res.clearCookie('title')

    res.render('addingList', data)
})

router.get('/favourites/:id_path/page/:page', (req, res, next) => {
    const user = req.user
    if (!user) return res.redirect('/login')

    const username = user.username
    const id_path = req.params.id_path;
    const page = parseInt(req.params.page,10)

    favouritesService.getUserList(username, id_path, page, (err, data) => {
        if (err) return next(err);

        data.previous_page = data.pageNumber - 1 > 0 ? data.pageNumber - 1 : null;
        data.next_page = (user.favourites.filter(f=>f.id_path==id_path)[0].totalPages > page) ? page + 1 : null;
        data.id_path=id_path
        data.page=page

        res.render('favouriteList', data)
    })

})


router.post('/list', (req, res, next) => {
    if (!req.user) return res.redirect('/login')

    const listName = req.body.listName
    favouritesService.addList(req.user, listName, undefined, (err) => {
        if (err) return next(err)
        res.redirect('/')
    })
})