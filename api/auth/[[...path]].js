const { createHandler } = require("../_vercelExpress");

module.exports = createHandler("/api/auth", { nested: true });
