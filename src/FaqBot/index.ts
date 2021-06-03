import * as Discord from "discord.js";
import { Article, getArticles } from "./getArticles";
import BestMatches from "../BestMatches";

export default class FaqBot {
  private refreshTime = 300000;
  private urls: string[];
  private articles!: Article[] | null;
  private client: Discord.Client;
  private highlightColor = 0xfe9073;
  private errorCorlor = 0xff0000;
  private userQuestions: Map<string, BestMatches> = new Map();

  constructor(urls: string[]) {
    this.urls = urls;
    this.client = new Discord.Client();
    this.loadArticles();
  }

  private async loadArticles() {
    this.articles = await getArticles(this.urls);

    setTimeout(() => this.loadArticles(), this.refreshTime);
  }

  private sendAnswer(message: Discord.Message, article: Article) {
    const answer = new Discord.MessageEmbed();
    answer.setTitle(`**${article.question}**`);
    answer.setDescription(article.answer);
    answer.setColor(this.highlightColor);
    article.url ? answer.setURL(article.url) : null;

    message.reply(answer);
  }

  private sendError(message: Discord.Message, errorMessage: string) {
    const response = new Discord.MessageEmbed();
    response.setTitle("**Something went wrong**");
    response.setDescription(errorMessage);
    response.setColor(this.errorCorlor);

    message.reply(response);
  }

  private noAnswerFound(message: Discord.Message) {
    const response = new Discord.MessageEmbed();
    response.setTitle("**Question not found**");
    response.setDescription("No question was found matching that number.\n");
    response.setColor(this.highlightColor);

    message.reply(response);
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

  private questionByNumber(message: Discord.Message) {
    const messageContent = message.content.trim();
    const userQuestions = this.userQuestions.get(message.author.id);
    const questionNumber = parseInt(messageContent);

    if (userQuestions) {
      if (
        questionNumber > userQuestions.matches.length - 1 ||
        questionNumber < 0
      ) {
        this.noAnswerFound(message);
      } else if (userQuestions.matches[questionNumber]) {
        this.sendAnswer(
          message,
          userQuestions.matches[parseInt(messageContent)].article
        );
      }
    } else {
      const response = new Discord.MessageEmbed();
      response.setTitle(
        "**Could not retrieve previously suggested questions**"
      );
      response.setDescription(
        "I could not retrieve your previously suggested questions. Please asking your original question again."
      );
      response.setColor(this.highlightColor);
      message.reply(response);
    }
  }

  private async answerQuestion(message: Discord.Message) {
    if (this.articles == null) {
      this.sendError(
        message,
        "An error occured while retrieving an answer to your question, please try again later"
      );
    } else {
      let msgContent = message.content.trim();
      let bestMatches = new BestMatches(this.articles, msgContent);

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
        this.userQuestions.set(message.author.id, bestMatches);
        let description = "";

        for (let match of bestMatches.matches) {
          description += `**${match.questionNumber}**: ${match.article.question}\n`;
        }

        description +=
          "\n**Type the number of the question you'd like answered.**\nCant find what you're looking for? Check our [Wiki](https://wiki.acala.network/)";

        const response = new Discord.MessageEmbed();
        response.setTitle(`**Did you mean:**`);
        response.setDescription(description);
        response.setColor(this.highlightColor);

        message.reply(response);
      }
    }
  }

  private onMessage(message: Discord.Message) {
    if (
      message.channel.type != "dm" ||
      message.author.id === this.client.user!.id
    ) {
      return;
    }

    let numberPattern = /\s*\d+\s*/;
    let helpCommandPattern = /\s*!help\s*/;

    if (helpCommandPattern.test(message.content)) {
      this.helpCommand(message);
    } else if (numberPattern.test(message.content)) {
      this.questionByNumber(message);
    } else {
      this.answerQuestion(message);
    }
  }

  public async login(token: string) {
    this.client.on("guildMemberAdd", async (newMember) => {
      console.log("added");
      const response = new Discord.MessageEmbed();
      response.setTitle(`**Welcome ${newMember}!**`);
      response.setDescription(
        `Welcome to the Acala Discord Server! Have any questions? Feel free to ask me and I'll do my best to answer them!`
      );
      response.setColor(this.highlightColor);

      try {
        const dmChannel = await newMember.createDM();
        dmChannel.send(response);
      } catch (error) {
        console.log(error);
      }
    });

    this.client.on("message", (message) => this.onMessage(message));

    this.client.on("ready", () => {
      console.log(
        `Logged in as ${this.client.user?.username}#${this.client.user?.discriminator}`
      );
    });

    this.client.login(token);
  }
}
