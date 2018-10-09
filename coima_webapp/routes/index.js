const express = require('express')
const router = express.Router()
const ApiInfo = require('../model/ApiInfo')


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('homePage',new ApiInfo())
})

module.exports = router
