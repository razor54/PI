'use strict'

module.exports = start

const Actor = require('./../model/Actor')
const Movie = require('./../model/Movie')
const MovieList = require('./../model/MovieList')
const ApiInfo = require('./../model/ApiInfo')

let req

const API_KEY = '8ccbfaaab52d4b5a42a3a5be4971fc18'

function start(data) {

    //use's local DataBase
    if (data) { req = data }

    //retrive data from Server
    else { req = require('request') }

    const services = {
        'getSearch': getSearch,//.memoize(),
        'getMovie': memoize(getMovie),
        'getActor': memoize(getActor),
        getHomePage
    }

    return services
}

function requestToJson(path, cb) {
    req(path, (err, res, data) => {
        if (err) return cb(err)
        const obj = JSON.parse(data.toString())
        cb(null, obj)
    })
}

function getSearch(name, page, cb) {

    const path = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${name}&page=${page}`



    requestToJson(path, (err, list) => {
        if (err) { cb(err); return }
        let movieList = new MovieList(list)
        movieList.name = name
        cb(null, movieList)
    })
}

function getMovie(movieId, cb) {
    const moviePath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
    const charactersPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`


    const urlArr = [moviePath, charactersPath]

    parallelGetRequest(urlArr, (err, paramArr) => {
        if (err) return cb(err)

        const movie = paramArr[0]
        const characters = paramArr[1]

        cb(null, new Movie(movie, characters))
    })


}

function getActor(actorId, cb) {

    const rolesPath = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${API_KEY}`
    const actorPath = `https://api.themoviedb.org/3/person/${actorId}?api_key=${API_KEY}`


    const urlArr = [actorPath, rolesPath]

    parallelGetRequest(urlArr, (err, paramArr) => {
        if (err) return cb(err)

        const actor = paramArr[0]
        const roles = paramArr[1]

        cb(null, new Actor(actor, roles))
    })

}

function getHomePage(pathNotUsed, cb) {

    cb(null, new ApiInfo())

}

function parallelGetRequest(urlArr, cb) {

    let counter = 0

    const results = []

    let i = 0

    urlArr.forEach(elem => {
        const index = i++
        req(elem, (err, rsp, data) => {
            if (err)
                return cb(err)

            const obj = JSON.parse(data.toString())
            results[index] = obj
            counter += 1
            if (counter == urlArr.length)
                cb(null, results)
        })

    })
}


//cache will contain the objects
function memoize(func) {

    const cache = {}

    return function () {
        let cb = arguments[arguments.length - 1]
        let key = JSON.stringify(arguments)
        if (cache[key]) {
            cb(null, cache[key])
        }
        else {

            let newCb = (err, data) => {
                if (err) return cb(err)
                cache[key] = data
                cb(null, data)
            }

            //segundo as convençoes o cb vem sempre em ultimo lugar dos parametros

            arguments[arguments.length - 1] = newCb

            func.apply(this, arguments)
        }
    }
}
