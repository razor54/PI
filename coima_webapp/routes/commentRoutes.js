
const commentService = require('../services/commentaryService')()
const express = require('express')
const router = express.Router()
module.exports = router



router.post('/movie/:movieId/comment', (req, res, next) => {
    //if user not logged in launch a popup...
    if (!req.user) return res.redirect('/login')

    const movieId = req.params.movieId
    const title = req.body.title

    const movies = { id: movieId, title: title }


    commentService.addCommentToSpecificMovie(movies, req.user, req.body.comment, (err, data) => {
        if (err)
            next(err)

        res.redirect(`/movie/${movieId}/comment/${data}`)
    })


})


router.get('/movie/:movieID/comment/:commentID', (req, res, next) => {
    //if user not logged in launch a popup...
    if (!req.user) return res.redirect('/login')



    const movieId = req.params.commentID


    commentService.getCommentariesForMovie(movieId, (err, data) => {
        if (err)
            next(err)

        const view = {
            commentObj:{
                data: data,
                movieId: data.movieId,
                id: data._id,
                title: data.movieTitle
            }
            
        }

        res.render('comments', data)
    })


})

router.post('/movie/:movieID/comment/:commentID/:id', (req, res, next) => {
    //if user not logged in launch a popup...
    if (!req.user) return res.redirect('/login')


    const commentId = req.params.commentID
    const cId = req.params.id

    const comment = req.body.comment

    commentService.addAnswerToCommentary(commentId, req.user, comment, cId, (err, commentId) => {
        if (err)
            next(err)
        res.redirect(`/movie/${req.params.movieID}/comment/${commentId}/`)
    })


})


