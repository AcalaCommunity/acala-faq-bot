import FaqBot from "./FaqBot";

if (!process.env.TOKEN) {
  console.log("No token set");
  process.exit(1);
} else {
  const faqBot = new FaqBot([
    "https://raw.githubusercontent.com/AcalaNetwork/acala-wiki/master/karura/crowdloan/faq.md",
  ], "./credentials.json");

  faqBot.login(process.env.TOKEN);
}
