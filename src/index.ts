import FaqBot from "./FaqBot";

if (!process.env.TOKEN) {
  console.log("No token set");
  process.exit(1);
} else {
  const acalaFaqBot = new FaqBot([], []);
  acalaFaqBot.login(process.env.TOKEN);
}
