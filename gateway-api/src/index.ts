import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Gateway API running on port ${PORT}`);
});

// Manejadores de errores globales
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo no manejado en:', promise, 'razón:', reason);
  process.exit(1);
});