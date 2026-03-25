/**
 * Stockage : PostgreSQL (InsForge) si DATABASE_URL / INSFORGE_DATABASE_URL est défini,
 * sinon fichiers JSON locaux (inforgeDevStore).
 */
const usePg = Boolean(
  process.env.DATABASE_URL || process.env.INSFORGE_DATABASE_URL || process.env.POSTGRES_URL
);

module.exports = usePg ? require("./pgStore") : require("./inforgeDevStore");
