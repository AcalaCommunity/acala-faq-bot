const Discord = require("discord.js");
const getArticles = require("./getArticles");

let questions;

const client = new Discord.Client();

const highlightColor = 0xfe9073;

function getSimilarity(question, questionAsked) {
  const ignore = ["when", "what", "do", "how", "is", "i", "the", "that", "how"];
  let matches = 0;

  const askedSet = new Set(questionAsked.split(" "));
  const questionSplit = question.split(" ");

  for (const word of askedSet) {
    for (const j of questionSplit) {
      if (ignore.includes(j)) {
        continue;
      } else if (j == word) {
        matches++;
      }
    }
  }

  return matches;
}

function insertMatch(matches, newMatch) {
  if (matches.length < 5) {
    matches.push(newMatch);
  } else {
    for (let i in matches) {
      if (matches[i].similarity <= newMatch.similarity) {
        matches.push(newMatch);
        break;
      }
    }
  }

  return matches
    .sort((a, b) => {
      return b.similarity - a.similarity;
    })
    .slice(0, 5);
}

function sendAnswer(message, question) {
  const answer = new Discord.MessageEmbed();
  answer.setTitle(`**${question.question}**`);
  answer.setDescription(question.answer);
  answer.setColor(highlightColor);
  question.url ? answer.setURL(question.url) : null;

  message.reply(answer);
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (message) => {
  if (message.channel.type != "dm") return;
  if (message.author.id == client.user.id) return;

  let msgContent = message.content.trim().toLowerCase();

  let numberPattern = /\d+/;

  if (numberPattern.test(msgContent)) {
    const q = questions[parseInt(message.content.trim())];

    if (q) {
      sendAnswer(message, q);
    } else {
      const response = new Discord.MessageEmbed();
      response.setTitle("**Question not found**");
      response.setDescription("No question was found matching that number.");
      response.setColor(highlightColor);

      message.reply(response);
    }
  } else if (msgContent == "!help") {
    const response = new Discord.MessageEmbed();
    response.setTitle("**How to use this bot**");
    response.setDescription(
      "Type any question and I'll try my best to find you an answer!"
    );
    response.setColor(highlightColor);

    message.reply(response);
  } else {
    let question =
      msgContent.charAt(msgContent.length - 1) != "?"
        ? msgContent + "?"
        : msgContent;

    let bestMatches = [];

    for (let i = 0; i < questions.length; i++) {
      let q = questions[i].question.toLowerCase();

      if (q == question) {
        sendAnswer(message, questions[i]);
        return;
      } else {
        const similarity = getSimilarity(q, question);

        if (similarity == 0) continue;

        const newMatch = {
          similarity: similarity,
          questionNumber: i,
          question: questions[i].question,
        };

        bestMatches = insertMatch(bestMatches, newMatch);
      }
    }

    if (bestMatches.length == 0) {
      const response = new Discord.MessageEmbed();
      response.setTitle(`**Couldn't find a match**`);
      response.setDescription(
        "Sorry, we couldn't find a match for your question"
      );
      response.setColor(highlightColor);

      message.reply(response);
    } else {
      let description = "";

      for (let match of bestMatches) {
        description += `**${match.questionNumber}**: ${match.question}\n`;
      }

      description +=
        "\n**Type the number of the question you'd like answered.**";

      const response = new Discord.MessageEmbed();
      response.setTitle(`**Did you mean:**`);
      response.setDescription(description);
      response.setColor(highlightColor);

      message.reply(response);
    }
  }
});

async function start(token) {
  questions = await getArticles();
  client.login(token);
}

module.exports = start;
