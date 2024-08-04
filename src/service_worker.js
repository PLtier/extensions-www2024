// import * as tf from "@tensorflow/tfjs";
// import * as posenet from "@tensorflow-models/posenet";
// import { padAndResizeTo } from "@tensorflow-models/posenet/dist/util";
// console.log("service worker", posenet, padAndResizeTo);
// because parcel unnecessarliy duplicate the .html files for every import or new URL used,
// we will import it here, and then set the corresponding URL in storage af
import urlOnboarding from "./onboarding.html";
import urlOffscreen from "./offscreen.html";
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  // set both URLs in storage
  console.log(chrome.storage);
  await chrome.storage.local.set({
    urlOnboarding: urlOnboarding,
    urlOffscreen: urlOffscreen,
  });

  if (reason === "install") {
    chrome.tabs.create({
      url: urlOnboarding,
    });
  }
});

console.log("service worker", chrome.offscreen);
