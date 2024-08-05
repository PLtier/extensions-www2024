document.getElementById("myButton").addEventListener("click", async () => {
  console.log("hello");
  const { urlOffscreen } = await chrome.storage.local.get("urlOffscreen");
  console.log(urlOffscreen);
  // alert("Button clicked!");

  chrome.offscreen.createDocument({
    url: urlOffscreen,
    reasons: ["USER_MEDIA"],
    justification: "User requested camera access",
  });
});
console.log(chrome.runtime.getURL("popup.html"));

print("Hello World");

console.log("popup", chrome.offscreen);
