'use strict'

const keyTokenModel = require("../models/keyToken.model")
const { Types } = require('mongoose')

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

    static findByUserId = async ( userId ) => {
        return await keyTokenModel.findOne({user: new Types.ObjectId(userId)}).lean()
    }

    static removeKeyById =  async (id) => {
        return await keyTokenModel.findByIdAndDelete(id).lean()
    }

    static findByRefreshTokenUsed = async ( refreshToken ) => {
        return await keyTokenModel.findOne( {refreshTokensUsed : refreshToken}).lean()
    }

    static removeKeyByUserId =  async (id) => {
        return await keyTokenModel.deleteOne({user: id}).lean()
    }


    static findByRefreshToken = async ( refreshToken ) => {
        return await keyTokenModel.findOne({refreshToken})
    }

}


module.exports = KeyTokenService