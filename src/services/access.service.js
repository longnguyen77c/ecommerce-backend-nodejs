'use strict'
const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const createTokenPair = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError } = require('../core/error.response')

const roleShop = {
    SHOP : 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
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