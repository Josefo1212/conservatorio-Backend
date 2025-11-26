"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const PORT = process.env.PORT || 3000;
app_1.default.use(express_1.default.json());
app_1.default.use(auth_routes_1.default);
async function main() {
    try {
        await database_1.default.connect();
        console.log('Connected to the database successfully.');
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
    app_1.default.listen(PORT, () => {
        console.log(`Auth service running on port ${PORT}`);
    });
}
main();
//# sourceMappingURL=index.js.map