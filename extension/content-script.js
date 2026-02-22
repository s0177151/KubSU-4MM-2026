//console.log("Hellom, world");
//alert("Hello, world");

//const pageTitle=document.title;
//console.log("Заголовок страници",pageTitle);

window.addEventListener("load", () => {
  const data = {
    action: "sendData",
    title: window.document.title,
    header: getAllHeaders(window),
  };
  chrome.runtime.sendMessage(data);
});

function getAllHeaders(window) {
  const result = window.document.body.querySelectorAll("h1");
  return Array.from(result)
    .map((h1) => h1.textContent.trim())
    .filter((el) => el !== "");
}

