'use strict'

const slugify = require('slugify')
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
    product_slug: {
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
        enum: ['Electronics', 'Clothing', 'Furniture']
    },

    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true,
    },
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be under 5.0'],
        set: (val) => Math.round(val * 10) / 10
    },
    product_variations: {
        type: Array,
        default: []
    },
    isDraft: { type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false},
},{
    collections: COLLECTION_NAME,
    timestamps: true,
})

// create index for search
productSchema.index({ product_name: 'text', product_description: 'text'})


// Document middleware: run before .save() and .create()
productSchema.pre('save', function( next) {
    this.product_slug = slugify(this.product_name, {lower: true})
    next()
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
    },    
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
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
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
    
}, {
    collection: 'electronics',
    timestamps: true,
})

const furnitureSchema = new Schema({
    manufacturer: {
        type: String, 
        require: true
    },
    model: String,
    color: String,    
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
    
}, {
    collection: 'furnitures',
    timestamps: true,
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothings', clothingSchema),
    furniture: model('Furnitures', furnitureSchema)
}