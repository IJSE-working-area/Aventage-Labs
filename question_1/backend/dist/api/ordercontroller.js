"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const promise_mysql_1 = __importDefault(require("promise-mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
exports.router = express_1.default.Router();
let pool;
dotenv_1.default.config();
initPool();
function initPool() {
    return __awaiter(this, void 0, void 0, function* () {
        pool = yield promise_mysql_1.default.createPool({
            host: process.env.host,
            port: +process.env.port,
            database: process.env.database,
            user: process.env.username,
            password: process.env.password,
            connectionLimit: +process.env.connection_limit
        });
    });
}
exports.router.get("/getMainDishes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mainDishesArray = yield pool.query('SELECT * FROM Menu WHERE Category=\'Main dish\'');
        const formattedMainDishesArray = mainDishesArray.map((row) => row);
        res.json(formattedMainDishesArray);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.get("/getsidedishes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sideDishesArray = yield pool.query('SELECT * FROM Menu WHERE Category=\'Side dish\'');
        const formattedSideDishesArray = sideDishesArray.map((row) => row);
        res.json(formattedSideDishesArray);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.get("/getdesserts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dessertArray = yield pool.query('SELECT * FROM Menu WHERE Category=\'Dessert\'');
        const formattedDessertArray = dessertArray.map((row) => row);
        res.json(formattedDessertArray);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    if (!reqBody) {
        res.sendStatus(400);
        return;
    }
    const result = yield pool.query('INSERT INTO `Order` (CustomerName, OrderDate) VALUES (?,?)', [reqBody.CustomerName, reqBody.OrderDate]);
    let selectedItems;
    selectedItems = req.body.selectedItems;
    for (const selectedItem of selectedItems) {
        const result2 = yield pool.query('INSERT INTO OrderItem (OrderID, ItemID) VALUES (?,?)', [result.insertId, selectedItem]);
    }
    res.status(201).json(result.insertId);
}));
exports.router.get("/getDailySalesRevenue", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date().toLocaleDateString().toString();
    try {
        const result = yield pool.query(`SELECT
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.get("/getMostFamousMainDish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query(`SELECT m.ItemName, COUNT(oi.ItemID) AS Occurrences
                                                 FROM OrderItem oi
                                                          JOIN Menu m ON oi.ItemID = m.ItemID
                                                 WHERE m.Category = 'Main dish'
                                                 GROUP BY m.ItemID
                                                 ORDER BY Occurrences DESC
                                                 LIMIT 1;
        `);
        const mostFamousMainDish = result.length > 0 ? (result[0]).ItemName : null;
        res.json(mostFamousMainDish);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.get("/getMostFamousSideDish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query(`
            SELECT m.ItemName, COUNT(oi.ItemID) AS Occurrences
            FROM OrderItem oi
                     JOIN Menu m ON oi.ItemID = m.ItemID
            WHERE m.Category = 'Side dish'
            GROUP BY m.ItemID
            ORDER BY Occurrences DESC
            LIMIT 1;
        `);
        const mostFamousSideDish = result.length > 0 ? (result[0]).ItemName : null;
        res.json(mostFamousSideDish);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.get("/mostConsumeDishVsMainDish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query(`
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
        const transformedResult = result.map((row) => {
            return {
                MainDish: row.MainDish,
                MostConsumedSideDish: row.MostConsumedSideDish
            };
        });
        console.log(transformedResult);
        res.json(transformedResult);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
