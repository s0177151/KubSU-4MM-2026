//console.log("Hellom, world");
//alert("Hello, world");

//const pageTitle=document.title;
//console.log("Заголовок страници",pageTitle);

//window.addEventListener("load", () => {
  //const data = {
    //action: "sendData",
    //title: window.document.title,
    //header: getAllHeaders(window),
  //};
  //chrome.runtime.sendMessage(data);
//});

//function getAllHeaders(window) {
  //const result = window.document.body.querySelectorAll("h1");
  //return Array.from(result)
    //.map((h1) => h1.textContent.trim())
    //.filter((el) => el !== "");
//}

const CONFIG = {
  MAX_TEXT_LENGTH: 1000,
  MAX_SUBTEXT_LENGTH: 200,
  MAX_IMAGES: 5,
  MIN_ALT_LENGTH: 10
};

const SELECTORS = {
  SEMANTIC_TAGS: [
    'header', 'footer', 'nav', 'aside', 
    'section', 'article', 'main', 'address'
  ],
  META_TAGS: [
    'name="description"',
    'name="keywords"', 
    'name="author"',
    'property="og:image"',
    'property="og:description"',
    'property="article:published_time"'
  ]
};

class PageContentParser {
  constructor() {
    this.config = CONFIG;
    this.selectors = SELECTORS;
  }

  extractTextContent() {
    if (!document.body?.innerText) {
      return "";
    }
    return document.body.innerText.trim().slice(0, this.config.MAX_TEXT_LENGTH);
  }

  extractHeaders() {
    const headers = [];
    for (let level = 1; level <= 6; level++) {
      document.querySelectorAll(`h${level}`).forEach((header) => {
        const text = header.innerText.trim();
        if (text) {
          headers.push(text);
        }
      });
    }
    return headers.join(".");
  }

  extractSemanticContent() {
    let semanticText = '';
    
    this.selectors.SEMANTIC_TAGS.forEach(tag => {
      const content = [];
      document.querySelectorAll(tag).forEach(el => {
        const text = el.textContent.trim();
        if (text) {
          content.push(text.slice(0, this.config.MAX_SUBTEXT_LENGTH));
        }
      });
      if (content.length) {
        semanticText += `\n\n Семантический тег ${tag}: ${content.join(', ')}`;
      }
    });
    
    return semanticText;
  }

  extractMetadata() {
    let metadataText = '';
    
    this.selectors.META_TAGS.forEach(metaSelector => {
      const element = document.querySelector(`meta[${metaSelector}]`);
      if (element?.content) {
        metadataText += `\n\n Метаданные ${metaSelector}: ${element.content}`;
      }
    });
    
    return metadataText;
  }

  extractImageDescriptions() {
    const images = document.querySelectorAll('img[alt]');
    const validAlts = [];
    images.forEach(img => {
      const alt = img.alt.trim();
      if (alt.length > this.config.MIN_ALT_LENGTH && alt.length < this.config.MAX_SUBTEXT_LENGTH) {
        validAlts.push(alt);
      }
    });
    
    return validAlts.length 
      ? `\n\n Описания изображений: ${validAlts.slice(0, this.config.MAX_IMAGES).join(' | ')}`
      : '';
  }

  parse() {
    const parts = [
      this.extractTextContent(),
      this.extractSemanticContent(),
      this.extractMetadata(),
      this.extractImageDescriptions()
    ];

    return parts.join('');
  }
}

function getCurrentTimestamp() {
  const date = new Date();
  return date.toISOString();
}

window.addEventListener('load', () => {
  const parser = new PageContentParser();
  
  const payload = {
    type: "view",
    url: location.href,
    title: document.title || "",
    lang: document.documentElement?.lang || "",
    text: parser.parse(),
    headers: parser.extractHeaders(),
    timestamp: getCurrentTimestamp()
  };

  console.log("Sending payload:", payload);
  chrome.runtime.sendMessage(payload);
});