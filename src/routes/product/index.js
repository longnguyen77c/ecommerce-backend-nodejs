'use strict'

const express = require('express')
const router = express.Router()
const ProductController = require('../../controllers/product.controller')
const  asyncHandler  = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const productController = require('../../controllers/product.controller')

// authentication
router.use(authentication)

////
router.post('/create', asyncHandler(productController.createProduct))


module.exports = router