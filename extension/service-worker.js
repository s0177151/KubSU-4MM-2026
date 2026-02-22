chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "sendData"){
        console.log(request.title);
console.log(request.header);
    }
})
