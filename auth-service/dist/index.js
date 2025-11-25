"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = process.env.PORT || 3000;
async function main() {
    try {
        // Test database connection
        await database_1.default.connect();
        console.log('Conectado a la base de datos exitosamente.');
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
    app_1.default.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
main();
//# sourceMappingURL=index.js.map