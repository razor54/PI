'use strict'

module.exports = start

const dbUsers = (process.env.DBHOST && process.env.DBPWD && process.env.DBUSER)?
'http://' + process.env.DBUSER + ":" + process.env.DBPWD + "@" +process.env.DBHOST + ":5984/g04pi" :
'http://127.0.0.1:5984/g04pi'

let request
const userService = require('./userService')()

function start(data) {

    //use's local DataBase
    if (data) {
        request = data
    }

    //retrive data from Server
    else {
        request = require('request')
    }

    const services = {
        addCommentToSpecificMovie,
        getCommentariesForMovie,
        addAnswerToCommentary

    }
    return services
}


function addCommentToSpecificMovie(movie, user, comment, cb) {

    const dataBaseMovieId = `${movie.id}%20${movie.title}`

    const dataBaseUri = `${dbUsers}/${dataBaseMovieId}`

    request(dataBaseUri, (err, res, body) => {
        if (err) return cb(err)
        if (res.statusCode != 200)
            //not Exists-- add new document
            return createNewDbCommentary(movie, user, comment, cb);
            
        const movieComments = JSON.parse(body);

        movieComments.comment.push({
            username: user.username,
            text: comment,
            answer: [],
            cId: `${movieComments.comment.length + 1}`
        })
        
        user.comments.push({
                text : comment,
                movieId : movie.id,
                movieTitle : movie.title
            })

        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieComments)
        }

        request(dataBaseUri, options, (err, res, body) => {
            if (err) return cb(err)
            
           
            userService.save(user,(err)=>{
                if(err)return cb(err)
                cb(null, dataBaseMovieId)
            })
        })




    })

    //find movie in database

    //if exists
    //add commentary
    //else 
    // create movie database
    //repeat or add commentary


}

function createNewDbCommentary(movie, user, comment, cb) {
    const movieTitle = movie.title
    const movieId = movie.id
    const dataBaseMovieId = `${movieId}%20${movieTitle}`
    const dataBaseUri = `${dbUsers}/${dataBaseMovieId}`
    //id of comment
    const cId = "1"
    const movieComments = {
        movieTitle: movieTitle,
        movieId: movieId,
        comment: [
            {
                username: user.username,
                text: comment,
                answer: [],
                cId: cId
            }
        ]
    }


    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieComments)
    }

    request(dataBaseUri, options, (err, res, body) => {
        if (err)
            return cb(err)

        cb(null, JSON.parse(body).id)


    })

}


function createCommentDb(dataBaseMovieId,cb) {
    
    const db= dataBaseMovieId.split(' ')
    const movieId = db.splice(0,1)
   
    const title = db.join(' ')
    const movieComments = {

        movieTitle: title,
        movieId: movieId[0],
        comment: [
           
        ]
    }


    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieComments)
    }
    const dataBaseUri = `${dbUsers}/${dataBaseMovieId}`
    request(dataBaseUri, options, (err, res, body) => {
        if(err)
             return cb(err)
        request(dataBaseUri,(err,res,body)=>{
            if(err)return cb(err)
            cb(null,JSON.parse(body))
        })
        
    })

}

function getCommentariesForMovie(dataBaseMovieId, cb) {
    const dataBaseUri = `${dbUsers}/${dataBaseMovieId}`

    request(dataBaseUri, (err, res, body) => {
        if (err) cb(err)
        if(res.statusCode == 404){
            return createCommentDb(dataBaseMovieId,cb)
        }
        if (res.statusCode != 200)
            return cb(null, null, "NO COMMENTS")
        const movieComments = JSON.parse(body);
        cb(null, movieComments)
    })

}



function addAnswerToCommentary(dataBaseMovieId, user, comment, cID, cb) {



    const dataBaseUri = `${dbUsers}/${dataBaseMovieId}`

    request(dataBaseUri, (err, res, body) => {
        if (err) return cb(err)

        const movieComments = JSON.parse(body);

        const comm = searchComment(cID, movieComments.comment)
        //verify if null


        comm.answer.push(
            {
                username: user.username,
                text: comment,
                answer: [],
                cId: `${comm.cId}-${comm.answer.length + 1}`
            }
        )


        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieComments)
        }

        request(dataBaseUri, options, (err, res, body) => {
            if (err) return cb(err)
            cb(null, dataBaseMovieId)
        })




    })

    //find movie in database

    //if exists
    //add commentary
    //else 
    // create movie database
    //repeat or add commentary


}

function searchComment(cid, comments) {

    if (comments && comments.length > 0) {

        
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].cId == cid) {
                return comments[i];
            }
            let found = searchComment(cid,comments[i].answer);
            if (found) return found;
        }
    };

}
