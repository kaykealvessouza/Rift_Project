import { createBackendApp } from './app.js';

const PORT = Number(process.env.BACKEND_PORT) || 7000;
const app = createBackendApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Rift Backend] Servidor HTTP REST rodando na porta ${PORT}`);
  console.log(`[Rift Backend] Base URL: http://localhost:${PORT}/api`);
});
