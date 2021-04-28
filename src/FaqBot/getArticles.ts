import axios from "axios";
import TurndownService from "turndown";

export interface Article {
  question: string;
  answer: string;
  url?: string;
}

interface ZenDeskArticle {
  title: string;
  body: string;
  html_url: string;
  section_id: number;
}

interface ZenDeskResponose {
  articles: ZenDeskArticle[];
  next_page?: string;
}

const questions: Article[] = [
  {
    question: "When is the Karura Parachain Auction (crowdloan)?",
    answer:
      "The date of the Karura Parachain Auction has not been announced. Once the date is known, we will make sure to announce on all of our official channels (e.g., Discord, Newsletter, Twitter, Telegram, etc.)",
  },
  {
    question: "What is the Karura Parachain Auction (crowdloan)?",
    answer:
      "The Karura Parachain Auction is the process by which projects launch on Kusama. You can find more information in this short video found here. ",
  },
  {
    question:
      "Which wallets should I use for the Karura Parachain Auction (crowdloan)?",
    answer:
      "Karura recommends using the Polkawallet mobile app or the Polkadot{.js} browser extension to contribute to the crowdloan module. Guides to setting up these wallets can be found here.",
  },
  {
    question:
      "Can I use my Metamask wallet for the Karura Parachain Auction (crowdloan)?",
    answer:
      "No. Metamask does not support the Polkadot ecosystem. Karura recommends using the Polkawallet mobile app or the Polkadot{.js} browser extension to contribute to the crowdloan module. Guides to setting up these wallets can be found here.",
  },
  {
    question: "How do I find my Kusama address?",
    answer:
      "Before you can find your address, you first need to set up a wallet. For assistance on setting up your wallet, please review our guide located here. Kusama addresses always begin with a capital letter (e.g., “D”, “E”, “F”, “G”, etc).",
  },
  {
    question:
      "Where can I buy KSM tokens to contribute to the crowdloan module?",
    answer: "A list of KSM markets can be found here.",
  },
  {
    question:
      "When should I transfer my KSM tokens to the Kusama address (wallet) that I’ll be using for the Karura Parachain Auction (crowdloan)?",
    answer:
      "The date of the Karura Parachain Auction has not been announced. Once the date is known, we will make sure to announce on all of our official channels (e.g., Discord, Newsletter, Twitter, Telegram, etc.)",
  },
  {
    question:
      "Are there any limits (minimum or maximum) to the amount of KSM tokens I can bond (lend) to the crowdloan module?",
    answer: "There are no limits on participation.",
  },
  {
    question: "Can I join the waitlist?",
    answer: "No. The period to join the waitlist has ended.",
  },
  {
    question:
      "Can I contribute to the crowdloan module if I haven’t signed up for the waitlist?",
    answer: "Yes. However, you won’t be entitled to the referral bonus.",
  },
];

export async function getArticles(sections: number[]) {
  const resp = await axios.get(
    "https://acala.zendesk.com/api/v2/help_center/en-us/articles"
  );

  const turndownService = new TurndownService({ bulletListMarker: "-" });

  let articles: Article[] = [];
  let endpoint = "https://acala.zendesk.com/api/v2/help_center/en-us/articles";

  while (true) {
    const resp = await axios.get(endpoint);

    if (resp.status != 200) {
      console.log("Could not retrieve articles");
      process.exit(1);
    }

    articles = articles.concat(
      (resp.data as ZenDeskResponose).articles
        .filter((article) => sections.length == 0 || sections.includes(article.section_id))
        .map((article) => {
          return {
            question: article.title,
            answer: turndownService.turndown(article.body),
            url: article.html_url,
            section: article.section_id
          };
        })
    );

    if (resp.data.next_page) {
      endpoint = resp.data.next_page;
    } else {
      break;
    }
  }

  return articles.concat(questions);
}
