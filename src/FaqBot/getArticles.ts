import axios from "axios";
import TurndownService from "turndown";

const turndownService = new TurndownService();

export interface Article {
  question: string;
  answer: string;
  url?: string;
}

function parseMarkdown(markdown: string): Article[] | null {
  let articles: Article[] = [];
  let markdownLines = markdown.split("\n");

  let question: string = "";
  let answer: string = "";
  for (let line of markdownLines) {
    line = line.trim();
    if (line.startsWith("###")) {
      if (question != "") {
        articles.push({ answer, question });
        answer = "";
      }
      question = line.slice(3).trim().replace(/\*\*/g, "");
    } else if (line.startsWith("#")) {
      continue;
    } else if (line === "" && answer === "") {
      continue;
    } else {
      answer += `${line}\n`;
    }
  }

  articles.push({ answer, question });

  return articles;
}

async function getArticle(url: string): Promise<Article[] | null> {
  try {
    const response = await axios.get(url);

    if (response.status == 200) {
      return parseMarkdown(response.data);
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getArticles(urls: string[]): Promise<Article[] | null> {
  let articles: Article[] = [];

  for (const url of urls) {
    let parsedArticle = await getArticle(url);
    if (parsedArticle != null) {
      articles = articles.concat(parsedArticle);
    } else {
      return null;
    }
  }

  return articles;
}
