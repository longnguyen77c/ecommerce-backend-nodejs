'use strict'

const { product, clothing, electronic, furniture} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')
const { 
    findAllDraftsForShop, 
    findAllPublishForShop, 
    publishProductByShop, 
    unPublishProductByShop, 
    searchProductByUser, 
    findAllProducts,
    findProduct,
    updateProductById
} = require('../models/repositories/product.repo')
const {removeUndefinedObject, updateNestedObjectParser} = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')


// define Factory class to create product
class ProductFactory {

    // V1

    // static async createProduct(type, payload){
    //     switch (type) {
    //         case 'Electronics':
    //             return new Electronic(payload).createProduct()
    //             case 'Clothing': {
                    
    //                 return new Clothing(payload).createProduct()
    //             }
    //             default: 
    //             throw new BadRequestError(`Invalid product type ${type}`)
    //         }
    //     }
        

    // v2

    static productRegistry = {}

    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) 
            throw new BadRequestError(`Invalid product type ${type}`)
        return new productClass(payload).createProduct()
    }


    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) 
            throw new BadRequestError(`Invalid product type ${type}`)
        return new productClass(payload).updateProduct(productId)
    }

    // PUT 

    static async publishProductByShop({product_shop, product_id}){
        return await publishProductByShop( {product_shop, product_id})
    }

    static async unPublishProductByShop({product_shop, product_id}){
        return await unPublishProductByShop( {product_shop, product_id})
    }






    // query 
    
    static async findAllDraftsForShop( {product_shop, limit = 30, skip = 0}){
        const query = { product_shop, isDraft: true}
        return await findAllDraftsForShop({query, limit, skip})
    }

    static async findAllPublishForShop( {product_shop, limit = 30, skip = 0}){
        const query = { product_shop, isPublished: true}
        return await findAllPublishForShop({query, limit, skip})
    }

    static async searchProducts ( {keySearch}){
        return await searchProductByUser({keySearch})
    }

    static async findProduct ( {product_id}){
        return await findProduct({product_id, unSelect: ['__v   ']})
    }

    static async findAllProducts ( {limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true}}){
        return await findAllProducts({limit, sort, filter, page, 
            select: ['product_name', 'product_price', 'product_thumb']
        })
    }
}



// defined base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_type,
        product_shop,
        product_attributes,
        product_quantity,
    }){
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_quantity = product_quantity
    }

    // create new product
    async createProduct(product_id){
        
        const newProduct = await product.create({...this, _id: product_id})
        if (newProduct) {
            // add product_stock in inventory collection
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }
        return newProduct
    }

    // update product
    async updateProduct(productId, bodyUpdate) { 
        return await updateProductById({productId, bodyUpdate, model: product})
    }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
    
    async createProduct(){
        
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BadRequestError('create new Clothing error')

        const newProduct = await super.createProduct()
        if (!newProduct) throw new BadRequestError('Create new product error')
        
        return newProduct
    }

    async updateProduct(productId) {
        // 1. remove attribute has null or undefined
        const objectParams = removeUndefinedObject(this)
        // 2. check where update

        if (objectParams.product_attributes){
            await updateProductById({
                productId, 
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), 
                model: clothing
            })
        }

        const updateProduct = super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
    }
}

// Define sub-class for different product types Electronic
class Electronic extends Product {
    
    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError('create new Electronic error')

        const newProduct = await super.createProduct()

        if (!newProduct) throw new BadRequestError('Create new product error')

        return newProduct
    }
}
class Furniture extends Product {
    
    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('create new Furniture error')

        const newProduct = await super.createProduct()

        if (!newProduct) throw new BadRequestError('Create new product error')

        return newProduct
    }
}

// register product type
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory