'use strict'
const JWT = require('jsonwebtoken')

const createTokenPair = async ( payload, publicKeyString, privateKey ) => {

    try {
        // access token
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 day'
        })        
        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256', 
            expiresIn: '7 day'
        } )

        //
        JWT.verify(accessToken, publicKeyString, (err, decode) => {
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
