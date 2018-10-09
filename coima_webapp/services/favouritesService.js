'use strict'

module.exports = start
const dbUsers = (process.env.DBHOST && process.env.DBPWD && process.env.DBUSER)?
'http://' + process.env.DBUSER + ":" + process.env.DBPWD + "@" +process.env.DBHOST + ":5984/g04pi" :
'http://127.0.0.1:5984/g04pi'
const uniqueIdGen = require('../utils/generateUniqueId')
const userService = require('./userService')()

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
        'saveFavourite': saveFavourite,
        'getUserList': getUserList,
        'addElementToList': addElementToList,
        'addList': addList,
        'removeList': removeList,
        'removeMovieFavourites': removeMovieFavourites,
        'lastMovieExchange':lastMovieExchange,
        'changeNames': changeNames
        
    }
    return services
}


function saveFavourite(user, cb) {

    const path = dbUsers + '/' + user.username

    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    }
    request(path, options, (err, res, body) => {
        if (err) return cb(err)
        cb()
    })
}

function getUserList(username, id_path, page, cb) {
    const path = dbUsers + '/' + id_path + '_pg='+page

    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }

    request(path, options, (err, res, body) => {
        if (err) return cb(err)

        const data = JSON.parse(body.toString())
        if (data.error)
            return cb(new Error("No list with this id"))

        if (data.user != username)
            //error
            return cb(new Error("You don't have access to this"))
        cb(null, data)
    })
}

function createNewPage(username,id_path,listName,page,cb){

    const path = dbUsers + '/' + id_path + '_pg='+page

    const listObj = {
        name: listName,
        movies: [],
        user: username,
        pageNumber:page,
        id_path:id_path
    }

    const opt = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listObj)
    }

    request(path, opt, (err,resp,data) => {
        if (err) return cb(err)
        const temp = JSON.parse(data)
        listObj._id=temp.id
        listObj._rev=temp.rev
        cb(null,listObj)
    })

}

function removeLastPage(user,id_path,rev,cb){

    const page = user.favourites.filter(e=>e.id_path==id_path)[0]

    const path = dbUsers + '/' + id_path + '_pg='+page.totalPages +'?rev=' + rev

    const opt = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }

    request(path, opt, (err)=>{

        if(err) cb(err)

        page.totalPages--

        const path = dbUsers + '/' + user._id

        const opt = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        }
        
        request(path, opt, (err)=>{
            if(err) cb(err)

            cb()
        })
        
    })
}


function getLastPage(user,id_path,cb){
    const maxPageSize = 10;    
    const list = user.favourites.filter(e=> e.id_path==id_path)[0]

    

    getUserList(user.username,list.id_path,list.totalPages,(err,data)=>{
        if(err) return cb(err)

        if(data.movies.length>=maxPageSize){

            list.totalPages++
            
            return createNewPage(user.username,id_path,list.name,list.totalPages,(err,data)=>{

                if(err) return cb(err)


                userService.save(user,(err)=>{
                    if(err) return cb(err)

                    cb(null,data)
                })
                
            })
        }

        cb(null,data)
    })
}


function addElementToList(user, id_path, movie, cb) {

    getLastPage(user, id_path, (err, data) => {
        if (err) cb(err);

        if (data.movies.filter(e => e.id == movie.id)[0]) {
            cb()
        }

        else {
            data.movies.push({
                id: movie.id,
                title: movie.title
            })

            const options = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }

            const path = dbUsers + '/' + id_path + '_pg=' + data.pageNumber
            
            request(path, options, (err,resp) => {
                if (err) return cb(err)
                
                cb(null,data.pageNumber)
            })
        }
    })

}

function changeNames(listId,newName,user, cb) {

    
    const userPath = dbUsers + '/' + user.username

    const filtered = user.favourites.filter(l => 
        l.id_path == listId
    )[0];

    filtered.name = newName;

    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    }

    request(userPath, options, (err) => {
        if (err) return cb(err)
    })

    cb()
    
    //TODO rename in each page
}




//PUSH de nova lista
function addList(user, listName, forceID,cb) {
    const username = user.username
    const userPath = dbUsers + '/' + username
    

    //Tentar garantir Id unico, mesmo que o utilizador tenha listas com o mesmo nome
    let id = uniqueIdGen(username) + uniqueIdGen(listName) + uniqueIdGen(username + listName)
    if (forceID)
        id = forceID;

    //gerar numero aleatorio com o id para a lista
    user.favourites.push({
        id_path: id,
        name: listName,
        totalPages:1
    })

    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    }

    request(userPath, options, (err) => {
        if (err) return cb(err)

        
        createNewPage(user.username,id,listName,1,(err)=>{
            if (err) return cb(err)
            cb()
        })

    })
}


function removeList(list, cb) {

    const totalPages = list.totalPages
    const id_path = list.id_path
    let position = 0

    for(let i = 1; i <= totalPages; ++i){

        const page_path = dbUsers + '/' + id_path + '_pg=' + i

        removePage(page_path,(err)=>{
            if(err) return cb(err)
            
            if(++position == totalPages){
                cb()
            }
        })
    }

}

function removePage(page_path,cb){

    const get_options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }

    request(page_path,get_options,(err,res,body)=>{
        if(err) cb(err)
        
        const rev = JSON.parse(body)._rev 
         
        const delete_Path = page_path + '?rev=' + rev

        const delete_options = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        }

        request(delete_Path,delete_options,(err)=>{
            if(err) cb(err)

            cb()
        })

    })
}

function removeMovieFavourites(user, id_path, page,id_movie, cb) {
    const username = user.username    
    const path = dbUsers + '/' + id_path + '_pg=' + page

    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }

    request(path, options, (err, res, body) => {
        if (err) return cb(err)

        const list = JSON.parse(body)
        if (list.user != username)
            return cb(new Error("You don't have access to this"))




        const mov = list.movies.filter(movie => movie.id != id_movie)

        list.movies = mov


        //case of last element, remove list
        if(list.movies.length<1 && list.pageNumber!=1){
            
            removeLastPage(user,id_path,list._rev,(err)=>{
                if (err) return cb(err)
                
                cb()
            })
            return
        }

        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list)
        }

        request(path, options, (err,resp) => {
            if (err) return cb(err)

            const rev = JSON.parse(resp.body).rev

            list._rev = rev //change rev with the new one

            cb(null,list)
        })

    })

}

function lastMovieExchange(user,id_path,page,list,cb){

    const lastPage = user.favourites.filter(e=>e.id_path==id_path)[0]
    const totalPages = lastPage.totalPages

    if(page==totalPages) return cb()

    
    getUserList(user.username,id_path, totalPages,(err,data)=>{

        if(err) cb(err)

        const lastElement = data.movies.pop()

        removeMovieFavourites(user,id_path,totalPages,lastElement.id,(err)=>{
            
            if(err) cb(err)

            list.movies.push(lastElement)

            const path = dbUsers + '/' + list._id
            
            const options = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(list)
            }


            request(path, options, (err,resp) => {
                if (err) return cb(err)

                cb()

            })
        })

    })
    

}
