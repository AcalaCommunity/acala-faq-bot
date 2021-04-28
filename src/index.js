const start = require("./faqBot");

if (!process.env.TOKEN) {
  console.log("No token set");
  process.exit(1);
} else {
  start(process.env.TOKEN);
}
