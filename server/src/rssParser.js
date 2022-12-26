import { json } from "express";
import Parser from "rss-parser";
import { convert } from "html-to-text";
// There is also an alias to `convert` called `htmlToText`.

let parser = new Parser({
  customFields: {
    item: ["content:encoded"],
  },
});

export const rssParser = async (url, lastElTime) => {
  let feedArr = [];
  let filttredfeedArr = [];
  let sortedByDateFeedArr = [];
  async function getFeedItems() {
    try {
      const feed = await parser.parseURL(url);
      feedArr = feed.items;
    } catch (e) {
      `RSS parser error : ${e}`;
    }
    sortedByDateFeedArr = feedArr.sort((a, b) => {
      return new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime();
    });

    filttredfeedArr = sortedByDateFeedArr
      .filter((e) => {
        return e.isoDate && new Date(e.isoDate).getTime() > lastElTime;
      })
      .map((e) => {
        return htmlToText(e);
      });
  }
  await getFeedItems();

  if (filttredfeedArr.length) {
    return {
      lastFeedItemTime: new Date(sortedByDateFeedArr.at(-1).isoDate).getTime(),
      items: filttredfeedArr,
    };
  } else {
  }
};

export const htmlToText = (obj) => {
  if (typeof obj === "object" && obj !== null) {
    const formatedObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      (formatedObj[key] = convert(value)),
        {
          wordwrap: 130,
        };
    });

    return formatedObj;
  } else {
    return;
  }
};
