import FaqBot from "./FaqBot";

const envVars = [process.env.DISCORD_TOKEN, process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY];

if (envVars.includes(undefined)) {
  console.log("DISCORD_TOKEN, CLIENT_EMAIL, or PRIVATE_KEY is not set");
  process.exit(1);
} else {
  const faqBot = new FaqBot([
    "https://raw.githubusercontent.com/AcalaNetwork/acala-wiki/master/karura/crowdloan/faq.md",
  ], envVars[1]!, envVars[2]!);

  faqBot.login(envVars[0]!);
}