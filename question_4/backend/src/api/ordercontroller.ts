import express, {json} from "express";
import mysql, {Pool} from "promise-mysql";
import dotenv from 'dotenv';

export const router = express.Router();

let pool: Pool;
dotenv.config();
initPool();

async function initPool() {
    pool = await mysql.createPool({
        host: process.env.host,
        port: +process.env.port!,
        database: process.env.database,
        user: process.env.username,
        password: process.env.password,
        connectionLimit: +process.env.connection_limit!
    });
}

type Items = {
    id: number,
    title: string,
    price: number,
    restaurant_id: number,
    restaurant_title: string
}
type reqBody = {
    selectedItems: [],
    quantities: {},
    totalPrice: number

}


router.get("/items", async (req, res) => {
    try {
        const itemArray = await pool.query(`
            SELECT Items.*, Restaurants.title as restaurant_title
            FROM Items
                     JOIN Restaurants ON Items.restaurant_id = Restaurants.id
        `);

        const formattedItemArray = itemArray.map((row: Items) => row);

        res.json(formattedItemArray);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/order", async (req, res) => {
    try {
        const reqBody = req.body;
        console.log(reqBody);

        if (!reqBody) {
            res.sendStatus(400);
            return
        }

        const result = await pool.query('INSERT INTO Invoices (total) VALUES (?)', [reqBody.totalPrice]);

        // selectedItems array divide into sub arrays according to restaurant_id
        const selectedItems = reqBody.selectedItems;
        const itemsByRestaurant = selectedItems.reduce((result: any, item: any) => {
            const {restaurant_id, ...rest} = item;

            if (!result[restaurant_id]) {
                result[restaurant_id] = [];
            }

            result[restaurant_id].push({restaurant_id, ...rest});

            return result;
        }, {});

        const arrayOfArrays = Object.keys(itemsByRestaurant).map(key => itemsByRestaurant[key]);

        console.log(arrayOfArrays);

        for (const arrayOfArray of arrayOfArrays) {
            if (arrayOfArray.length === 1) {
                const result2 = await pool.query('INSERT INTO Orders (invoice_id, restaurant_id, item_id, quantity) VALUES (?,?,?,?)', [result.insertId, arrayOfArray[0].restaurant_id, arrayOfArray[0].id, reqBody.quantities[`${arrayOfArray[0].id}`]]);
            } else {
                for (const arrayOfArrayElement of arrayOfArray) {
                    const result2 = await pool.query('INSERT INTO Orders (invoice_id, restaurant_id, item_id, quantity) VALUES (?,?,?,?)', [result.insertId, arrayOfArrayElement.restaurant_id, arrayOfArrayElement.id, reqBody.quantities[`${arrayOfArrayElement.id}`]]);
                }
            }
        }

        res.status(201);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



