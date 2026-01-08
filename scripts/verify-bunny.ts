import { loadEnvConfig } from "@next/env";
import { uploadImageToBunny } from "../src/lib/bunny";

// Load environment variables from .env.local, .env, etc.
loadEnvConfig(process.cwd());

async function verify() {
    console.log("Iniciando prueba de subida a Bunny.net...");

    // Check env vars explicitly for the script's sake
    const required = ["BUNNY_STORAGE_API_KEY", "BUNNY_STORAGE_ZONE_NAME", "BUNNY_PULL_ZONE_URL"];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Faltan variables de entorno:", missing.join(", "));
        console.error("Por favor configura .env.local antes de ejecutar este script.");
        process.exit(1);
    }

    try {
        // Create a dummy buffer (1x1 transparent GIF or just text)
        const buffer = Buffer.from("Test file content for Bunny.net verification", "utf-8");

        // Upload
        const filename = `test-${Date.now()}.txt`;
        console.log(`Subiendo archivo de prueba: ${filename}`);

        const url = await uploadImageToBunny(buffer, filename);

        console.log("✅ Subida exitosa!");
        console.log("URL Pública:", url);
        console.log("\nPor favor verifica que puedes acceder a esa URL en tu navegador.");

    } catch (error) {
        console.error("❌ Error durante la verificación:", error);
        process.exit(1);
    }
}

verify();
