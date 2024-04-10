'use strict'
const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const {AuthFailureError, NotFoundError} = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
}

const createTokenPair = async ( payload, publicKey, privateKey ) => {
    
    try {
        // access token
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 day'
        })        
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 day'
        } )

        //
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err){
                console.log(`Error verify::`, err)
            } else {
                console.log('Decode::', decode)
            }
        }) 
        return {accessToken, refreshToken}
    } catch (error) {
        
    }
}

const authentication = asyncHandler( async (req, res, next) => {
    /*
        1 - Check userId missing? 
        2 - get accessToken
        3 - verifyToken
        4 - check user in bds?
        5 - check keyStore with this userId
        6 - return next

    */
    // // 1
    // const userId = req.headers[HEADER.CLIENT_ID]
    // if (!userId) throw new AuthFailureError('Invalid request')

    // // 2
    // const keyStore = await findByUserId(userId)

    // if (!keyStore) throw new NotFoundError('Not found keystore')

    // // 3
    // const accessToken = req.headers[HEADER.AUTHORIZATION]
    // if (!accessToken) throw new AuthFailureError('Invalid request')

    // try {
    //     const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    //     if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')
    //     req.keyStore = keyStore
    //     return next()
    // } catch (error) {
    //     throw error
    // }

    // 1
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid request')

    // 2
    const keyStore = await findByUserId(userId)

    //3
    if (req.headers[HEADER.REFRESHTOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify( refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) 
                throw new AuthFailureError('Invalid UserId')
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }
    
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken ) 
        throw new AuthFailureError('Invalid request')
    try {
        const decodeUser = req.headers[HEADER.AUTHORIZATION]
        if (userId !== decodeUser.userId) 
            throw new AuthFailureError('Invalid UserId')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

const verifyJWT = async ( token, keySecret ) => {
    return await JWT.verify( token, keySecret)
}

module.exports = {
    authentication,
    createTokenPair, 
    verifyJWT
}
