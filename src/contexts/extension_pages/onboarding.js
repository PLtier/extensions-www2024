document
  .getElementById("grant-camera-permission")
  .addEventListener("click", async () => {
    const { urlOffscreen } = await chrome.storage.local.get("urlOffscreen");
    console.log(urlOffscreen, "YEH");
    console.log("HEEJJ");
    await navigator.mediaDevices.getUserMedia({ video: true });
    chrome.offscreen.createDocument({
      url: urlOffscreen,
      reasons: ["USER_MEDIA"],
      justification: "User requested camera access",
    });
  });

console.log("onboarding", chrome.offscreen);
