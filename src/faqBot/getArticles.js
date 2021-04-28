const axios = require("axios").default;
const TurndownService = require("turndown");

async function getArticles() {
  const resp = await axios.get(
    "https://acala.zendesk.com/api/v2/help_center/en-us/articles"
  );

  const turndownService = new TurndownService({ bulletListMarker: "-" });

  let articles = [];
  let endpoint = "https://acala.zendesk.com/api/v2/help_center/en-us/articles";

  while (true) {
    const resp = await axios.get(endpoint);

    if (resp.status != 200) {
      console.log("Could not retrieve articles");
      process.exit(1);
    }

    for (const article of resp.data.articles) {
      articles.push({
        question: article.title,
        answer: turndownService.turndown(article.body),
        url: article.html_url,
      });
    }

    if (resp.data.next_page) {
      endpoint = resp.data.next_page;
    } else {
      break;
    }
  }

  return articles;
}

module.exports = getArticles;
