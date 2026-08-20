import pool from "../db/connection.js"

export async function getAllOrders() {
    const ordersResult = await pool.query(`
        SELECT order_id as "orderId",
            first_name as "firstName",
            last_name as "lastName",
            street,
            postal_code as "postalCode",
            city,
            longitude::float8 AS "longitude",
            latitude::float8 AS "latitude",
            comment,
            geocoding_status as "geocodingStatus",
            geocoding_error as "geocodingError"
        FROM orders
        ORDER BY order_id
    `)
    const orders = ordersResult.rows

    const itemsResult = await pool.query(`
        SELECT order_id as "orderId",
            size,
            quantity
        FROM order_items
    `)
    const items = itemsResult.rows
    
    const orderMap = new Map()
    for(const order of orders){
        order.items = []
        orderMap.set(order.orderId, order)
    }
    for(const item of items){
        const order = orderMap.get(item.orderId)
        order.items.push({ size: item.size, quantity: item.quantity})
    }
    return orders
}

export async function saveOrders(orders) {
    const dbConnection = await pool.connect()
    try{
        await dbConnection.query("BEGIN")
        for(const order of orders){
            const orderResult = await dbConnection.query(
                `INSERT INTO orders (first_name, last_name, street, postal_code, city, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_id`,
                [order.firstName, order.lastName, order.street, order.postalCode, order.city, order.comment]
            )
            const orderId = orderResult.rows[0].order_id;
            for(const item of order.items){
                await dbConnection.query(`
                    INSERT INTO order_items (size, quantity, order_id) VALUES ($1, $2, $3)`,
                    [item.size, item.quantity, orderId]
                )
            }
        }
        await dbConnection.query("COMMIT")
    }catch(error){
        await dbConnection.query("ROLLBACK")
        throw error
    }finally{
        dbConnection.release()
    }
}

export async function getOrdersForGeocoding() {
    const result = await pool.query(`
        SELECT order_id as "orderId",
            street,
            postal_code as "postalCode",
            city
        FROM orders
        WHERE geocoding_status = 'not_started'
    `)
    return result.rows
}

export async function updateGeocodingResults(orders) {
    const dbConnection = await pool.connect()
    try{
        await dbConnection.query("BEGIN")
        for(const order of orders){
            await dbConnection.query(
                `UPDATE orders SET longitude = $1, latitude = $2, geocoding_status = $3, geocoding_error = $4 WHERE order_id = $5`,
                [order.longitude, order.latitude, order.geocodingStatus, order.geocodingError, order.orderId]
            )
        }
        await dbConnection.query("COMMIT")
    }catch(error){
        await dbConnection.query("ROLLBACK")
        throw error
    }finally{
        dbConnection.release()
    }
}

export async function deleteAllData() {
    const dbConnection = await pool.connect()
    try{
        await dbConnection.query("BEGIN")
        await dbConnection.query("DELETE FROM orders")
        await dbConnection.query("DELETE FROM routes")
        await dbConnection.query("COMMIT")
    }catch(error){
        await dbConnection.query("ROLLBACK")
        throw error
    }finally{
        dbConnection.release()
    }
}
