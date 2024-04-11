'use strict'

const { inventory } = require('../../models/inventory.model')

const insertInventory = async ({
    productId, shopId, stock, location = 'unknown'
}) => {
    return await inventory.create({
        inventory_productId: productId,
        inventory_stock: stock,
        inventory_location: location,
        inventory_shopId: shopId
    })
}

module.exports = {
    insertInventory
}