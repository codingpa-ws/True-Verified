function logURL(requestDetails) {
  console.log(`Loading`, requestDetails);
}

browser.webRequest.onCompleted.addListener(logURL, {
  urls: ["*://*.twitter.com/*"],
});
