const { app, usePg, port } = require("./app");

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`DocuGest API listening on http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(`Stockage: ${usePg ? "PostgreSQL (InsForge)" : "JSON local (local-inforge-dev)"}`);
  });
}
