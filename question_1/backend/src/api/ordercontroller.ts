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


type  Order = {
    OrderID: number,
    CustomerName: string,
    OrderDate: string
}

type  Menu = {
    ItemID: number,
    Category: string,
    ItemName: string,
    ItemPrice: number
}

type reqBody={
    CustomerName:string,
    OrderDate:string,
    selectedItems:number[]


}

interface DishResult {
    MainDish: string;
    MostConsumedSideDish: string;
}

router.get("/getMainDishes", async (req, res) => {
    try {
        const mainDishesArray = await pool.query<Menu[]>('SELECT * FROM Menu WHERE Category=\'Main dish\'');
        const formattedMainDishesArray = mainDishesArray.map((row: Menu) => row);

        res.json(formattedMainDishesArray);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getsidedishes", async (req, res) => {
    try {
        const sideDishesArray = await pool.query<Menu[]>('SELECT * FROM Menu WHERE Category=\'Side dish\'');
        const formattedSideDishesArray = sideDishesArray.map((row: Menu) => row);

        res.json(formattedSideDishesArray);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getdesserts", async (req, res) => {
    try {
        const dessertArray = await pool.query<Menu[]>('SELECT * FROM Menu WHERE Category=\'Dessert\'');
        const formattedDessertArray = dessertArray.map((row: Menu) => row);

        res.json(formattedDessertArray);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/', async (req, res) => {

    const  reqBody  = req.body;
    if (!reqBody) {
        res.sendStatus(400);
        return
    }

    const result = await pool.query('INSERT INTO `Order` (CustomerName, OrderDate) VALUES (?,?)', [reqBody.CustomerName,reqBody.OrderDate]);

    let selectedItems:[];
    selectedItems = req.body.selectedItems;
    for (const selectedItem of selectedItems) {
        const result2 = await pool.query('INSERT INTO OrderItem (OrderID, ItemID) VALUES (?,?)', [result.insertId,selectedItem]);
    }

    res.status(201).json(result.insertId);


});


router.get("/getDailySalesRevenue", async (req, res) => {
    const today = new Date().toLocaleDateString().toString();

    try {
        const result = await pool.query(`SELECT
                                                SUM(m.ItemPrice) AS DailySalesRevenue
                                         FROM \`Order\` o
                                                  JOIN
                                              OrderItem oi ON o.OrderID = oi.OrderID
                                                  JOIN
                                              Menu m ON oi.ItemID = m.ItemID
                                         WHERE o.OrderDate = '${today}'
                                         GROUP BY o.OrderDate;
        `);
        const dailySalesRevenue = result.length > 0 ? result[0].DailySalesRevenue : 0;
        res.json(dailySalesRevenue);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getMostFamousMainDish", async (req, res) => {
    try {
        const result = await pool.query(`SELECT m.ItemName, COUNT(oi.ItemID) AS Occurrences
                                                 FROM OrderItem oi
                                                          JOIN Menu m ON oi.ItemID = m.ItemID
                                                 WHERE m.Category = 'Main dish'
                                                 GROUP BY m.ItemID
                                                 ORDER BY Occurrences DESC
                                                 LIMIT 1;
        `);

        const mostFamousMainDish = result.length > 0 ? (result[0] ).ItemName : null;

        res.json(mostFamousMainDish);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getMostFamousSideDish", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.ItemName, COUNT(oi.ItemID) AS Occurrences
            FROM OrderItem oi
                     JOIN Menu m ON oi.ItemID = m.ItemID
            WHERE m.Category = 'Side dish'
            GROUP BY m.ItemID
            ORDER BY Occurrences DESC
            LIMIT 1;
        `);
        const mostFamousSideDish = result.length > 0 ? (result[0] ).ItemName : null;

        res.json(mostFamousSideDish);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/mostConsumeDishVsMainDish", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                mMain.ItemName AS MainDish,
                (
                    SELECT mSide.ItemName
                    FROM (
                             SELECT
                                 oiMain.ItemID AS MainDishID,
                                 oiSide.ItemID AS SideDishID,
                                 COUNT(*) AS occurrences
                             FROM
                                 OrderItem oiMain
                                     JOIN
                                 Menu mMain ON oiMain.ItemID = mMain.ItemID
                                     JOIN
                                 OrderItem oiSide ON oiMain.OrderID = oiSide.OrderID
                                     JOIN
                                 Menu mSide ON oiSide.ItemID = mSide.ItemID
                             WHERE
                                 mMain.Category = 'Main dish'
                               AND mSide.Category = 'Side dish'
                             GROUP BY
                                 oiMain.ItemID, oiSide.ItemID
                         ) AS CountedOccurrences
                             JOIN
                         Menu mSide ON CountedOccurrences.SideDishID = mSide.ItemID
                    WHERE CountedOccurrences.MainDishID = mMain.ItemID
                    ORDER BY occurrences DESC
                    LIMIT 1
                ) AS MostConsumedSideDish,
                MAX(occurrences) AS MaxOccurrences
            FROM (
                     SELECT
                         oiMain.ItemID AS MainDishID,
                         oiSide.ItemID AS SideDishID,
                         COUNT(*) AS occurrences
                     FROM
                         OrderItem oiMain
                             JOIN
                         Menu mMain ON oiMain.ItemID = mMain.ItemID
                             JOIN
                         OrderItem oiSide ON oiMain.OrderID = oiSide.OrderID
                             JOIN
                         Menu mSide ON oiSide.ItemID = mSide.ItemID
                     WHERE
                         mMain.Category = 'Main dish'
                       AND mSide.Category = 'Side dish'
                     GROUP BY
                         oiMain.ItemID, oiSide.ItemID
                 ) AS CountedOccurrences
                     JOIN
                 Menu mMain ON CountedOccurrences.MainDishID = mMain.ItemID
            GROUP BY
                CountedOccurrences.MainDishID
            ORDER BY
                MaxOccurrences DESC;


        `);


        const transformedResult: DishResult[] = result.map((row: any) => {
            return {
                MainDish: row.MainDish,
                MostConsumedSideDish: row.MostConsumedSideDish   };
        });
        console.log(transformedResult)
        res.json(transformedResult);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
