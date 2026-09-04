// Carga .env para los tests que tocan la base de datos (contrato de la API).
// Node 22 trae process.loadEnvFile; si no existe .env, los tests de contrato se saltan.
import { existsSync } from "node:fs";

if (existsSync(".env")) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // sin .env: los tests que lo necesitan comprueban DATABASE_URL y se saltan
  }
}
