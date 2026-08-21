import pool from "../db/connection.js"

export async function saveRoutes(routes) {
    const dbConnection = await pool.connect()
    try{
        await dbConnection.query("BEGIN")
        await dbConnection.query("DELETE FROM routes")
        for(const route of routes){
            const routeResult = await dbConnection.query(
                `INSERT INTO routes (team_number) VALUES ($1) RETURNING route_id`,
                [route.teamNumber]
            )
            const routeId = routeResult.rows[0].route_id;
            for(const stop of route.stops){
                await dbConnection.query(`
                    INSERT INTO stops (distance, sequence_position, order_id, route_id) VALUES ($1, $2, $3, $4)`,
                    [stop.distance, stop.sequencePosition, stop.orderId, routeId]
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

export async function getAllRoutes() {
    const stopsOrdersResult = await pool.query(`
        SELECT s.stop_id as "stopId",
            s.route_id as "routeId",
            s.distance::float8 as "distance",
            s.sequence_position as "sequencePosition",
            o.order_id as "orderId",
            o.first_name as "firstName",
            o.last_name as "lastName",
            o.street,
            o.postal_code as "postalCode",
            o.city,
            o.longitude::float8 AS "longitude",
            o.latitude::float8 AS "latitude",
            o.comment
        FROM stops s
        JOIN orders o ON o.order_id = s.order_id
        ORDER BY s.route_id, s.sequence_position
    `)
    const stopsOrders = stopsOrdersResult.rows

    const routesResult = await pool.query(`
        SELECT route_id as "routeId",
            team_number as "teamNumber"
        FROM routes
        ORDER BY team_number
    `)
    const routes = routesResult.rows

    const itemsResult = await pool.query(`
        SELECT order_id as "orderId",
            size,
            quantity
        FROM order_items
    `)
    const items = itemsResult.rows

    const routeMap = new Map()
    for(const route of routes){
        route.stops = []
        routeMap.set(route.routeId, route)
    }
    for(const stop of stopsOrders){
        const route = routeMap.get(stop.routeId)
        route.stops.push(stop)
    }

    const stopMap = new Map()
    for(const stop of stopsOrders){
        stop.items = []
        stopMap.set(stop.orderId, stop)
    }
    for(const item of items){
        const stop = stopMap.get(item.orderId)
        if(stop){
            stop.items.push({ size: item.size, quantity: item.quantity})
        }
    }
    return routes
}

export async function getRouteById(routeId) {
    const routeResult = await pool.query(`
        SELECT route_id as "routeId",
            team_number as "teamNumber"
        FROM routes
        WHERE route_id = $1`,
        [routeId]
    )
    const route = routeResult.rows[0]

    if(!route){ return null }

    const stopsOrdersResult = await pool.query(`
        SELECT s.stop_id as "stopId",
            s.route_id as "routeId",
            s.distance::float8 as "distance",
            s.sequence_position as "sequencePosition",
            o.order_id as "orderId",
            o.first_name as "firstName",
            o.last_name as "lastName",
            o.street,
            o.postal_code as "postalCode",
            o.city,
            o.longitude::float8 AS "longitude",
            o.latitude::float8 AS "latitude",
            o.comment
        FROM stops s
        JOIN orders o ON o.order_id = s.order_id
        WHERE s.route_id = $1
        ORDER BY s.sequence_position`,
        [routeId]
    )
    const stopsOrders = stopsOrdersResult.rows
    
    const itemsResult = await pool.query(`
        SELECT i.order_id as "orderId",
            i.size,
            i.quantity
        FROM order_items i
        JOIN stops s ON s.order_id = i.order_id
        WHERE s.route_id = $1`,
        [routeId]
    )
    const items = itemsResult.rows

    const stopMap = new Map()
    for(const stop of stopsOrders){
        stop.items = []
        stopMap.set(stop.orderId, stop)
    }
    for(const item of items){
        const stop = stopMap.get(item.orderId)
        stop.items.push({ size: item.size, quantity: item.quantity})
    }

    route.stops = stopsOrders
    return route
}
