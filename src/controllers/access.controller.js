'use strict'

const AccessService = require("../services/access.service")
const {OK, CREATED, SuccessResponse} = require('../core/success.response')

class AccessController {

    handlerRefreshToken= async (req, res, next ) => {
        new SuccessResponse({ 
            message: 'Get token success',
            metadata: await AccessService.handleRefreshToken( req.body.refreshToken)
        }).send(res)
    }

    logout = async (req, res, next ) => {
        new SuccessResponse({ 
            message: 'Logout success',
            metadata: await AccessService.logout( req.keyStore)
        }).send(res)
    }
    
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login( req.body)
        }).send(res)
    }
    signUp = async (req, res, next) => {
        
        // try {
        //     console.log(`[P]::signUp::`,req.body)
        //     /* 
        //         200 OK
        //         201 CREATED
        //     */
        //     return res.status(201).json(await AccessService.signUp(req.body))
        // } catch (error) {
        //     next(error)
        // }

        // return res.status(201).json(await AccessService.signUp(req.body))
        new CREATED({
            message: 'Registered OK',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10,
            }
        }).send(res)
    }
}

module.exports = new AccessController()