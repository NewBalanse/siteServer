"use strict";
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var homePage = require('./routes/index');
module.exports = express()
    .use(cors())
    .use(logger('dev'))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use('/', homePage);
