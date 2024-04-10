'use strict'
const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const {createTokenPair, verifyJWT} = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail} = require('../services/shop.service')


const roleShop = {
    SHOP : 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /*
        check token used 
    */
    static   handleRefreshToken = async ({keyStore, user, refreshToken} ) => {
        
        const {userId, email} = user
        
        if (keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.removeKeyByUserId(userId)
            throw new ForbiddenError('Something wrong! Please retry login')
            
        }

        if (keyStore.refreshToken !== refreshToken) 
            throw new AuthFailureError('Shop not registered')
        
        const foundShop = await findByEmail( {email} )

         // create new token
        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey)

        console.log(123123123213)
        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed:  refreshToken // refreshToken was used
            }
        })

        return {
            user,
            tokens
        }

    }
    // static handleRefreshToken = async (refreshToken ) => {
        
    //     const foundToken = await KeyTokenService.findByRefreshTokenUsed( refreshToken )
    //     if (foundToken ){
    //         // decode 
    //         const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
    //         console.log(userId, email)
    //         // delete all keys
    //         await KeyTokenService.removeKeyByUserId(userId)

    //         throw new ForbiddenError('Something wrong! Please retry login')
            
    //     }
        
    //     // No
    //     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    //     if (!holderToken ) throw new AuthFailureError('Shop not registered')
    //     // verify token
    //     const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
    //     console.log('2:',userId, email)
        
    //     // Check user
    //     const foundShop = await findByEmail( {email} )
    //     if (!foundShop) throw new AuthFailureError('Shop not registered 2')

    //     // create new token
    //     const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

    //     console.log(123123123213)
    //     // update token
    //     await holderToken.updateOne({
    //         $set: {
    //             refreshToken: tokens.refreshToken
    //         },
    //         $addToSet: {
    //             refreshTokensUsed:  refreshToken // refreshToken was used
    //         }
    //     })

    //     return {
    //         user: {userId, email},
    //         tokens
    //     }
    // }

    static logout = async ( keyStore ) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }
    

    /*
        1 - check email in dbs
        2 - match password
        3 - create AT vs RT and Save
        4 - generate tokens
        5 - get data return login
    */
    
    static login = async ( {email, password, refreshToken = null }) => {

        // 1
        const foundShop = await findByEmail({email}) 
        if (!foundShop) throw new BadRequestError('Shop not registered')

        // 2
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error')

        // 3 
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // 4
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            userId,
            privateKey,
            publicKey

        })
        return {
            shop: getInfoData({fields: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
    }
    

    static signUp = async ({name, email, password}) => {
        // try {
            // step1: check email exists?
            const holderShop = await shopModel.findOne({email}).lean()
            
            
            if (holderShop) {
                // return {
                //     code: 'xxxx',
                //     message: 'Shop already registered!!!'
                // }
                throw new BadRequestError('Error: Shop already registered')
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({ 
                name, email, password: passwordHash, roles: [roleShop.SHOP ]
            })

            if (newShop) {
                // Create publicKey, privateKey
                const {privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { 
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                
                }, )

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId : newShop._id,
                    publicKey: publicKey
                })


                if (!publicKeyString) {
                    return { 
                        code: 'XXX',
                        message: 'publicKeyString error '
                    }
                }
                
                // create token pair 
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyString, privateKey)
                console.log(`Create tokens success:::`, tokens)
                

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields : ['_id', 'name', 'email' ], object : newShop}),
                        tokens
                    }
                }
                
            } 
            return {
                code: 200,
                metadata: null
            }
        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService