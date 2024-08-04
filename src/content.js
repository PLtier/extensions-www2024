// receive the message sent from service_worker using .runtime API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message from service worker:", message);
  // send the message to the content script
  // now, do crazy stuff: if the message.data is above 0.5, then scroll down the page.
  // we are inside of content script, so we can do anything we want here

  if (message.data[1].probability > 0.5) {
    window.scrollBy(0, 100, { behavior: "smooth" });
  }
});
