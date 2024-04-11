'user strict'

const ProductService = require('../services/product.service')
const {SuccessResponse} = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {
        
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId

            }
        )
        }).send(res)


    }

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product success!',
            metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId

            }
        )
        }).send(res)
    }
    publishProductByShop = async (req, res, next) => {

        new SuccessResponse({
            message: 'Publish product success!',
            metadata: await ProductService.publishProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId

            }
        )
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next) => {

        new SuccessResponse({
            message: 'unPublish product success!',
            metadata: await ProductService.unPublishProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId

            }
        )
        }).send(res)
    }

    /**
     * @desc Get all Draft for shop 
     * @param {Number} limit 
     * @param {Number} skip  
     * @param {JSON} 
     */
    // Query
    getAllDraftsForShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list draft success',
            metadata: await ProductService.findAllDraftsForShop( {
                product_shop: req.user.userId

            }
        )
        }).send(res)
    }

    getAllPublishForShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list publish success',
            metadata: await ProductService.findAllPublishForShop( {
                product_shop: req.user.userId

            }
        )
        }).send(res)
    }

    getListSearchProduct = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list search products success',
            metadata: await ProductService.searchProducts( req.params)
        }).send(res)
    }

    findAllProducts = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list findAllProducts success',
            metadata: await ProductService.findAllProducts( req.params)
        }).send(res)
    }
    
    findProduct = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list findProduct success',
            metadata: await ProductService.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
    // End Query
}

module.exports = new ProductController