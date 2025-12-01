"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseService_1 = require("../services/DatabaseService");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Crear instancia del servicio con variables de entorno
const dbService = new DatabaseService_1.DatabaseService({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
// Cargar queries predefinidas en el namespace 'user'
const queriesPath = path_1.default.join(__dirname, '../queries/queries.json');
try {
    dbService.loadQueries(queriesPath, 'user');
}
catch (e) {
    console.warn('No se pudieron cargar las queries predefinidas de user.', e);
}
exports.default = dbService;
//# sourceMappingURL=database.js.map