import FaqBot from "./FaqBot";

if (!process.env.TOKEN) {
  console.log("No token set");
  process.exit(1);
} else {
  const acalaFaqBot = new FaqBot([], ["762376093633740849"]);
  const karuraFaqBot = new FaqBot([900001946923], ["837069729876934759"])

  acalaFaqBot.login(process.env.TOKEN);
  karuraFaqBot.login(process.env.TOKEN);
}
