const { createHandler } = require("../_vercelExpress");

module.exports = createHandler("/api/documents", { nested: true });
