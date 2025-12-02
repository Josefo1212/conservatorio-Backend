"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseService_1 = require("../services/DatabaseService");
const queries_json_1 = __importDefault(require("../queries/queries.json"));
dotenv_1.default.config();
const dbService = new DatabaseService_1.DatabaseService({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
// Obtenemos el pool del servicio para mantener compatibilidad si es necesario
const pool = dbService.getPool();
exports.pool = pool;
// Cargar queries predefinidas
dbService.queries = { auth: queries_json_1.default };
exports.default = dbService;
//# sourceMappingURL=database.js.map