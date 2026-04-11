const express = require("express");
const router = express.Router();
const MessagingResponse = require("twilio").twiml.MessagingResponse;

// temporary state (later DB)
const userState = {};

router.post("/webhook", (req, res) => {
  const msg = req.body.Body?.trim().toLowerCase();
  const sender = req.body.From;

  console.log("Incoming:", msg);

  const twiml = new MessagingResponse();

  if (!userState[sender]) {
    userState[sender] = { step: "issue" };

    twiml.message("Select issue:\n1. Garbage 🗑️\n2. Water 💧\n3. Road 🛣️");
  }

  else if (userState[sender].step === "issue") {
    let issue;

    if (msg === "1" || msg.includes("garbage")) issue = "Garbage";
    else if (msg === "2" || msg.includes("water")) issue = "Water";
    else if (msg === "3" || msg.includes("road")) issue = "Road";
    else {
      twiml.message("Please select:\n1. Garbage\n2. Water\n3. Road");
    }

    if (issue) {
      userState[sender].issue = issue;
      userState[sender].step = "location";

      twiml.message(`You selected ${issue}. Now send location 📍`);
    }
  }

  else if (userState[sender].step === "location") {
    const issue = userState[sender].issue;

    let location;

    // 📍 If user sends location via WhatsApp
    if (req.body.Latitude && req.body.Longitude) {
        location = {
            lat: req.body.Latitude,
            lng: req.body.Longitude
        };
    } 
    // 📝 fallback if user types manually
    else {
        location = msg;
    }

    console.log({ sender, issue, location });

    // TODO: Save to MongoDB here

    delete userState[sender];

    twiml.message("✅ Issue stored successfully!");
}
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

module.exports = router;
