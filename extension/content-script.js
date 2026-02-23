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
    return document.body?.innerText 
      ? document.body.innerText.trim().slice(0, this.config.MAX_TEXT_LENGTH)
      : '';
  }

  extractHeaders() {
    let headersText = '';
    
    for (let level = 1; level <= 6; level++) {
      const headers = this.getElementsText(`h${level}`);
      if (headers.length) {
        headersText += `\n\n Заголовки h${level}: ${headers.join(', ')}`;
      }
    }
    
    return headersText;
  }

  extractSemanticContent() {
    let semanticText = '';
    
    this.selectors.SEMANTIC_TAGS.forEach(tag => {
      const content = this.getElementsText(tag, true);
      if (content.length) {
        const truncatedContent = content.join(', ').slice(0, this.config.MAX_SUBTEXT_LENGTH);
        semanticText += `\n\n Семантический тег ${tag}: ${truncatedContent}`;
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
    const validAlts = Array.from(images)
      .map(img => img.alt.trim())
      .filter(alt => 
        alt.length > this.config.MIN_ALT_LENGTH && 
        alt.length < this.config.MAX_SUBTEXT_LENGTH
      )
      .slice(0, this.config.MAX_IMAGES);
    
    return validAlts.length 
      ? `\n\n Описания изображений: ${validAlts.join(' | ')}`
      : '';
  }

  getElementsText(selector, truncate = false) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements)
      .map(el => el.textContent.trim())
      .filter(text => text !== '');
  }

  parse() {
    const parts = [
      this.extractTextContent(),
      this.extractHeaders(),
      this.extractSemanticContent(),
      this.extractMetadata(),
      this.extractImageDescriptions()
    ];

    return parts.join('');
  }
}

function createPagePayload() {
  const parser = new PageContentParser();
  
  return {
    type: 'view',
    url: location.href,
    title: document.title || '',
    lang: document.documentElement?.lang || '',
    text: parser.parse()
  };
}

function sendPageData() {
  const payload = createPagePayload();
  chrome.runtime.sendMessage(payload);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sendPageData);
} else {
  sendPageData();
}
