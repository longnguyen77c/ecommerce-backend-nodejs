'use strict'

const {model, Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true,
    },
    product_thumb: {
        type: String,
        required: true,
    },
    product_description: {
        type: String,
    },
    product_price: {
        type: Number,
        required: true,
    },
    product_quantity: {
        type: Number,
        required: true,
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronics', 'clothing', 'Furniture']
    },

    product_shop: {
        type: Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes: {
        type: Types.Mixed,
        required: true,
    },
},{
    collections: COLLECTION_NAME,
    timestamps: true,
})

// define the product type = clothing
const clothingSchema = new Schema({
    brand: {
        type: String, 
        require: true,
    },
    size: {
        type: String,
    },
    material: {
        type: String,
    }
}, {
    collection: 'clothes',
    timestamps: true,
})

// define the product type: electronic
const electronicSchema = new Schema({
    manufacturer: {
        type: String, 
        require: true
    },
    model: String,
    color: String,
}, {
    collection: 'electronics',
    timestamps: true,
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothings', clothingSchema)
}