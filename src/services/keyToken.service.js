'use strict'

const keyTokenModel = require("../models/keyToken.model")

class KeyTokenService {
    static createKeyToken = async ({ userId , publicKey, privateKey, refreshToken}) => {
        try {
            // const publicKeyString = publicKey.toString()
            // const tokens = await keyTokenModel.create({
            //     user : userId,
            //     publicKey : publicKeyString
            // })

            const filter = {user: userId}, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }, options = { upsert: true, new: true}

            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }
}

module.exports = KeyTokenService