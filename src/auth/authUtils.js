'use strict'
const JWT = require('jsonwebtoken')

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

module.exports = 
    createTokenPair
