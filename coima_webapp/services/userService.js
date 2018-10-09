'use strict'

module.exports = start
const dbUsers = (process.env.DBHOST && process.env.DBPWD && process.env.DBUSER)?
'http://' + process.env.DBUSER + ":" + process.env.DBPWD + "@" +process.env.DBHOST + ":5984/g04pi" :
'http://127.0.0.1:5984/g04pi'
let request

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
        'find': find,
        'authenticate': authenticate,
        'saveNewUser': saveNewUser,
        'save':save
    }
    return services
}

function find(user, cb) {
    const path = dbUsers + '/' + user

    request(path, (err, res, body) => {
        if (err) return cb(err)
        cb(null, JSON.parse(body))
    })
}

function authenticate(username, passwd, cb) {
    const path = dbUsers + '/' + username

    request(path, (err, res, body) => {
        if (err) return cb(err)
        if (res.statusCode != 200) return cb(null, null, `User ${username} does not exists`)
        const user = JSON.parse(body)
        if (passwd != user.password) return cb(null, null, 'Invalid password')
        cb(null, user)
    })
}

function saveNewUser(user, cb) {

    const path = dbUsers + '/' + user.body.username
    user.body.favourites = []
    user.body.comments = []
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user.body)
    }
    request(path, options, (err, res, body) => {
        if (err) return cb(err)
        cb()
    })
}

function save(user, cb) {
    const path = dbUsers + '/' + user.username
    const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(user)
    }
    request(path, options, (err, res, body) => {
        if(err) return cb(err)
        cb()
    })
}