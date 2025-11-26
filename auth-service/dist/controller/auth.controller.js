"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const auth_queries_1 = require("../queries/auth.queries");
async function login(req, res) {
    try {
        const { cedula, password } = req.body;
        if (!cedula || !password)
            return res.status(400).json({ message: 'cedula y contraseña requeridos' });
        const { rows } = await (0, auth_queries_1.getUserByCedula)(cedula);
        const user = rows[0];
        if (!user)
            return res.status(401).json({ message: 'Credenciales inválidas' });
        res.status(200).json({ message: 'Login exitoso', user: { id: user.id_usuario } });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
//# sourceMappingURL=auth.controller.js.map