/**
 * Couvre /api/<un seul segment> (ex. /api/health). Les chemins /api/a/b passent par
 * api/auth/[[...path]].js, api/admin/[[...path]].js ou api/documents/[[...path]].js.
 */
const { createHandler } = require("./_vercelExpress");

module.exports = createHandler("/api", { nested: false });
