const { createHandler } = require("../_vercelExpress");

module.exports = createHandler("/api/admin", { nested: true });
