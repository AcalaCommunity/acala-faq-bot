import { Article } from "../FaqBot/getArticles";

const MAX_MATCHES = 10;

const IGNORE = [
  "when",
  "what",
  "do",
  "how",
  "is",
  "i",
  "the",
  "that",
  "how",
  "an",
  "to",
  "my",
  "can",
  "a",
  "to",
];

interface Match {
  similarity: number;
  questionNumber: number;
  article: Article;
}

export default class BestMatches {
  public matches: Match[] = [];
  public exactMatch?: Article;

  constructor(articles: Article[], question: string) {
    question = question.toLocaleLowerCase();
    question =
      question.charAt(question.length - 1) === "?"
        ? question.slice(0, question.length - 1)
        : question;

    for (let i = 0; i < articles.length; i++) {
      let articleQuestion = articles[i].question.toLocaleLowerCase().trim();
      articleQuestion =
        articleQuestion.charAt(articleQuestion.length - 1) === "?"
          ? articleQuestion.slice(0, articleQuestion.length - 1)
          : articleQuestion;

      if (question === articleQuestion) {
        this.exactMatch = articles[i];
        return;
      } else {
        this.insertMatch({
          similarity: this.getSimilarity(articleQuestion, question),
          questionNumber: i,
          article: articles[i],
        });
      }
    }

    for (let i = 0; i < this.matches.length; i++) {
      this.matches[i].questionNumber = i;
    }
  }

  private getSimilarity(articleQuestion: string, userQuestion: string) {
    let hits: Set<string> = new Set();

    const userSet = new Set(userQuestion.split(" "));
    const articleSplit = articleQuestion.split(" ").map((word) => {
      return word.replace("(", "").replace(")", "");
    });

    for (const word of userSet) {
      for (const j of articleSplit) {
        if (IGNORE.includes(j)) {
          continue;
        } else if (j == word) {
          hits.add(word);
        }
      }
    }

    return hits.size;
  }

  public insertMatch(newMatch: Match) {
    if (newMatch.similarity == 0) {
      return;
    } else if (this.matches.length < MAX_MATCHES) {
      this.matches.push(newMatch);
    } else {
      for (let i in this.matches) {
        if (this.matches[i].similarity <= newMatch.similarity) {
          this.matches.push(newMatch);
          break;
        }
      }
    }

    this.matches = this.matches
      .sort((a, b) => {
        return b.similarity - a.similarity;
      })
      .slice(0, MAX_MATCHES);
  }
}
