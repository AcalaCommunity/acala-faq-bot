import * as Discord from "discord.js";
import { Article, getArticles } from "./getArticles";
import BestMatches from "../BestMatches";

export default class FaqBot {
  private sections: number[];
  private channels: string[];
  private client: Discord.Client;
  private articles!: Article[];
  private highlightColor = 0xfe9073;

  constructor(sections: number[], channels: string[]) {
    this.sections = sections;
    this.channels = channels;
    this.client = new Discord.Client();
  }

  private sendAnswer(message: Discord.Message, article: Article) {
    const answer = new Discord.MessageEmbed();
    answer.setTitle(`**${article.question}**`);
    answer.setDescription(article.answer);
    answer.setColor(this.highlightColor);
    article.url ? answer.setURL(article.url) : null;

    message.reply(answer);
  }

  private helpCommand(message: Discord.Message) {
    const response = new Discord.MessageEmbed();
    response.setTitle("**How to use this bot**");
    response.setDescription(
      "Type any question and I'll try my best to find you an answer!"
    );
    response.setColor(this.highlightColor);

    message.reply(response);
  }

  private onMessage(message: Discord.Message) {
    console.log("test");
    if (
      message.channel.type != "dm" ||
      !this.client.user ||
      message.author.id == this.client.user!.id
    ) {
      return;
    }

    let msgContent = message.content.trim();

    let numberPattern = /\d+/;

    if (numberPattern.test(msgContent)) {
      const article = this.articles[parseInt(message.content.trim())];

      if (article) {
        this.sendAnswer(message, article);
      } else {
        const response = new Discord.MessageEmbed();
        response.setTitle("**Question not found**");
        response.setDescription("No question was found matching that number.");
        response.setColor(this.highlightColor);

        message.reply(response);
      }
    } else if (msgContent == "!help") {
      this.helpCommand(message);
    } else {
      let bestMatches = new BestMatches(this.articles, message.content);

      if (bestMatches.exactMatch) {
        this.sendAnswer(message, bestMatches.exactMatch);
      } else if (bestMatches.matches.length == 0) {
        const response = new Discord.MessageEmbed();
        response.setTitle(`**Couldn't find a match**`);
        response.setDescription(
          "Sorry, we couldn't find a match for your question"
        );
        response.setColor(this.highlightColor);

        message.reply(response);
      } else {
        let description = "";

        for (let match of bestMatches.matches) {
          description += `**${match.questionNumber}**: ${match.article.question}\n`;
        }

        description +=
          "\n**Type the number of the question you'd like answered.**";

        const response = new Discord.MessageEmbed();
        response.setTitle(`**Did you mean:**`);
        response.setDescription(description);
        response.setColor(this.highlightColor);

        message.reply(response);
      }
    }
  }

  public async login(token: string) {
    this.articles = await getArticles(this.sections);

    this.client.on("message", (message) => this.onMessage(message));

    this.client.on("ready", () => {
      console.log(
        `Logged in as ${this.client.user?.username}#${this.client.user?.discriminator}`
      );
    });

    this.client.login(token);
  }
}