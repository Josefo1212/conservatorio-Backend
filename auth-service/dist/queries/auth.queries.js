"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByCedula = getUserByCedula;
const database_1 = __importDefault(require("../config/database"));
async function getUserByCedula(cedula) {
    return await database_1.default.query('SELECT id_usuario, password FROM usuario WHERE cedula = $1', [cedula]);
}
//# sourceMappingURL=auth.queries.js.map