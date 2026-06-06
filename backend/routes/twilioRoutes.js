const express = require("express");
const router = express.Router();
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const Issue = require("../models/Issue");

const userState = {};

function mapCategory(input) {
  const mapping = {
    "1": "Garbage",
    "2": "Water",
    "3": "Road"
  };
  return mapping[input] || null;
}

/**
 * Helper: Parse location from multiple sources
 * 1. Direct Twilio coordinates (WhatsApp live location)
 * 2. Google Maps URL
 * 3. Direct CSV format
 * Returns: { lat, lng } or null
 */
function parseLocation(input, latitude, longitude) {
  try {
    // 1️⃣ Check for Twilio live location (WhatsApp shared location)
    if (latitude && longitude) {
      return {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };
    }

    if (!input) return null;

    // 2️⃣ Try to extract from Google Maps URL
    // Format: https://maps.google.com/maps?q=LAT,LNG or https://www.google.com/maps?q=LAT,LNG
    const urlPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const urlMatch = input.match(urlPattern);
    
    if (urlMatch) {
      return {
        lat: parseFloat(urlMatch[1]),
        lng: parseFloat(urlMatch[2])
      };
    }

    // 3️⃣ Try direct CSV format: "LAT,LNG"
    const csvPattern = /^(-?\d+\.?\d*),(-?\d+\.?\d*)$/;
    const csvMatch = input.match(csvPattern);
    
    if (csvMatch) {
      return {
        lat: parseFloat(csvMatch[1]),
        lng: parseFloat(csvMatch[2])
      };
    }

    return null;
  } catch (err) {
    console.error("Error parsing location:", err);
    return null;
  }
}

/**
 * Helper: Create Issue document in MongoDB
 */
async function createIssueFromWhatsApp(category, location, mediaUrl, whatsappNumber) {
  try {
    // Build description with WhatsApp metadata
    let description = `Reported via WhatsApp`;
    if (mediaUrl) {
      description += `\nImage: ${mediaUrl}`;
    }

    // Create new issue
    const newIssue = new Issue({
      category,
      severity: 3, // default
      status: "pending",
      title: `Issue reported via WhatsApp - ${category}`,
      description,
      userId: null, // Leave null since we don't have a user account yet
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat], // Important: [lng, lat] for MongoDB
        address: `Location: ${location.lat}, ${location.lng}`
      },
      upvotes: 0,
      upvotedBy: [],
      requestedVolunteers: []
    });

    await newIssue.save();
    console.log(`✅ Issue created from WhatsApp (${whatsappNumber}):`, newIssue._id);
    return newIssue;
  } catch (err) {
    console.error("Error creating issue:", err);
    throw err;
  }
}

/**
 * Main Twilio Webhook Handler
 */
router.post("/webhook", async (req, res) => {
  try {
    const msg = req.body.Body?.trim().toLowerCase() || "";
    const sender = req.body.From || "unknown"; // "whatsapp:+918630572225"
    
    // Media handling
    const numMedia = parseInt(req.body.NumMedia || "0");
    const mediaUrl = numMedia > 0 ? req.body.MediaUrl0 : null;

    // Live location handling (WhatsApp shared location)
    const latitude = req.body.Latitude;
    const longitude = req.body.Longitude;

    console.log(`📱 WhatsApp from ${sender}: "${msg}" | Media: ${numMedia > 0 ? "Yes" : "No"} | Location: ${latitude && longitude ? `(${latitude}, ${longitude})` : "No"}`);

    const twiml = new MessagingResponse();

    // ============ STEP 1: Issue Selection ============
    if (!userState[sender]) {
      userState[sender] = { step: "issue" };
      twiml.message("🚀 Welcome to JanSevak!\n\nSelect issue type:\n1. Garbage 🗑️\n2. Water 💧\n3. Road 🛣️");
    }

    // ============ STEP 2: Location ============
    else if (userState[sender].step === "issue") {
      const category = mapCategory(msg);

      if (!category) {
        twiml.message("❌ Invalid selection. Please choose:\n1. Garbage 🗑️\n2. Water 💧\n3. Road 🛣️");
        return res.writeHead(200, { "Content-Type": "text/xml" }), res.end(twiml.toString());
      }

      userState[sender].category = category;
      userState[sender].step = "location";
      twiml.message(`✅ You selected: ${category}\n\n📍 Now send your location:\n• Share live location (best!), OR\n• Google Maps link, OR\n• Type coordinates (28.4498,77.5824)`);
    }

    // ============ STEP 3: Media (Optional) or Create Issue ============
    else if (userState[sender].step === "location") {
      const category = userState[sender].category;
      const location = parseLocation(msg, latitude, longitude);

      if (!location) {
        twiml.message("❌ Location not recognized. Please send:\n• Share live location from Maps, OR\n• Google Maps link, OR\n• Coordinates (e.g., 28.4498,77.5824)");
        return res.writeHead(200, { "Content-Type": "text/xml" }), res.end(twiml.toString());
      }

      userState[sender].location = location;

      // Ask for optional image or confirm
      userState[sender].step = "media";
      twiml.message(`📌 Location saved: (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})\n\n📸 Send an image (optional) or type "done" to submit.`);
    }

    // ============ STEP 4: Handle Media or Confirmation ============
    else if (userState[sender].step === "media") {
      const category = userState[sender].category;
      const location = userState[sender].location;

      // User sent live location - update and confirm
      if (latitude && longitude) {
        const newLocation = parseLocation(msg, latitude, longitude);
        if (newLocation) {
          userState[sender].location = newLocation;
          twiml.message(`📍 Location updated: (${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)})\n\n📸 Send an image (optional) or type "done" to submit.`);
          return res.writeHead(200, { "Content-Type": "text/xml" }), res.end(twiml.toString());
        }
      }

      // User typed "done" or similar confirmation
      if (msg === "done" || msg === "ok" || msg === "submit" || msg === "yes") {
        // Create issue without image
        await createIssueFromWhatsApp(category, location, null, sender);
        delete userState[sender];
        twiml.message("✅ Issue stored successfully!\n\nThank you for reporting. Volunteers will help soon! 🙏");
      }
      // User sent image
      else if (mediaUrl) {
        // Create issue with image URL
        await createIssueFromWhatsApp(category, location, mediaUrl, sender);
        delete userState[sender];
        twiml.message("✅ Issue with image stored successfully!\n\nThank you for reporting. Volunteers will help soon! 🙏");
      }
      // User sent text instead - ask again
      else {
        twiml.message("📸 Please send an image or type 'done' to skip.");
      }
    }

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  } catch (err) {
    console.error("Webhook error:", err);
    const twiml = new MessagingResponse();
    twiml.message("❌ Error processing your request. Please try again.");
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  }
});

module.exports = router;
