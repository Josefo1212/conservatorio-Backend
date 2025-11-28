"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseService_1 = require("../services/DatabaseService");
const path_1 = __importDefault(require("path"));
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
// Nota: Asegúrate de que el archivo queries.json se copie al directorio dist al compilar
const queriesPath = path_1.default.join(__dirname, '../queries/queries.json');
// En desarrollo puede que necesitemos ajustar si __dirname apunta a src o dist
if (process.env.NODE_ENV !== 'production') {
    // Lógica adicional si es necesario, pero path relativo suele funcionar si la estructura se mantiene
}
try {
    // Cargamos las queries en el namespace 'auth' para acceder como dbService.queries.auth.nombreQuery
    dbService.loadQueries(queriesPath, 'auth');
}
catch (e) {
    console.warn('No se pudieron cargar las queries predefinidas. Asegúrate de que el archivo existe.', e);
}
exports.default = dbService;
//# sourceMappingURL=database.js.map