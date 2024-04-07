'use strict'

const {Schema, model} = require('mongoose')

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

var keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Shop',
    },
    publicKey: {
        type: String,
        require: true,
    },
    refreshToken: {
        type: String,
        require: true
    },
    refreshTokensUsed: {
        type: Array,
        default: []
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
})

module.exports = model(DOCUMENT_NAME, keyTokenSchema  )