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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.router.get("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemArray = yield pool.query(`
            SELECT Items.*, Restaurants.title as restaurant_title
            FROM Items
                     JOIN Restaurants ON Items.restaurant_id = Restaurants.id
        `);
        const formattedItemArray = itemArray.map((row) => row);
        res.json(formattedItemArray);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
exports.router.post("/order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqBody = req.body;
        console.log(reqBody);
        if (!reqBody) {
            res.sendStatus(400);
            return;
        }
        const result = yield pool.query('INSERT INTO Invoices (total) VALUES (?)', [reqBody.totalPrice]);
        // selectedItems array divide into sub arrays according to restaurant_id
        const selectedItems = reqBody.selectedItems;
        const itemsByRestaurant = selectedItems.reduce((result, item) => {
            const { restaurant_id } = item, rest = __rest(item, ["restaurant_id"]);
            if (!result[restaurant_id]) {
                result[restaurant_id] = [];
            }
            result[restaurant_id].push(Object.assign({ restaurant_id }, rest));
            return result;
        }, {});
        const arrayOfArrays = Object.keys(itemsByRestaurant).map(key => itemsByRestaurant[key]);
        console.log(arrayOfArrays);
        for (const arrayOfArray of arrayOfArrays) {
            if (arrayOfArray.length === 1) {
                const result2 = yield pool.query('INSERT INTO Orders (invoice_id, restaurant_id, item_id, quantity) VALUES (?,?,?,?)', [result.insertId, arrayOfArray[0].restaurant_id, arrayOfArray[0].id, reqBody.quantities[`${arrayOfArray[0].id}`]]);
            }
            else {
                for (const arrayOfArrayElement of arrayOfArray) {
                    const result2 = yield pool.query('INSERT INTO Orders (invoice_id, restaurant_id, item_id, quantity) VALUES (?,?,?,?)', [result.insertId, arrayOfArrayElement.restaurant_id, arrayOfArrayElement.id, reqBody.quantities[`${arrayOfArrayElement.id}`]]);
                }
            }
        }
        res.status(201);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
