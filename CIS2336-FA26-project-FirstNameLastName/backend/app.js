// start your backend for the project with this file// UH Sugar Land Student Center - Express server
// Serves the front-end and handles room booking requests.
// Bookings are kept in a JavaScript object in memory, so they
// are cleared every time the server restarts.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// The 5 rooms (must match ROOMS in frontend/script.js)
const rooms = {
  "study-a": { name: "Study Room A", capacity: 4 },
  "study-b": { name: "Study Room B", capacity: 6 },
  "collab-lab": { name: "Collaboration Lab", capacity: 10 },
  "media-studio": { name: "Media Studio", capacity: 3 },
  "conference": { name: "Conference Room", capacity: 16 }
};

// Booked rooms, keyed by room id
const bookings = {};
Object.keys(rooms).forEach((id) => (bookings[id] = []));

let nextId = 1;

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// GET: list the rooms and their current bookings
app.get("/api/rooms", (req, res) => {
  const list = Object.entries(rooms).map(([id, room]) => ({
    id,
    ...room,
    bookings: bookings[id].map(({ date, startTime, endTime }) => ({ date, startTime, endTime }))
  }));
  res.json(list);
});

// POST: try to book a room, reply with a confirmation or a decline
app.post("/api/bookings", (req, res) => {
  const { name, email, psid, room, date, startTime, endTime, attendees } = req.body || {};

  if (!name || !email || !psid || !room || !date || !startTime || !endTime || !attendees) {
    return res.status(400).json({ success: false, message: "Some required fields are missing." });
  }
  if (!rooms[room]) {
    return res.status(400).json({ success: false, message: "That room does not exist." });
  }
  if (!/^[^\s@]+@(cougarnet\.)?uh\.edu$/i.test(email) || !/^\d{7}$/.test(psid)) {
    return res.status(400).json({ success: false, message: "Please use a valid UH email and 7-digit PSID." });
  }

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end <= start || start < 8 * 60 || end > 21 * 60 || end - start > 180) {
    return res.status(400).json({ success: false, message: "Bookings must be 8 AM-9 PM and at most 3 hours." });
  }
  if (Number(attendees) > rooms[room].capacity) {
    return res.status(400).json({
      success: false,
      message: `${rooms[room].name} holds up to ${rooms[room].capacity} people.`
    });
  }

  // Availability check: does this time overlap an existing booking?
  const conflict = bookings[room].find(
    (b) => b.date === date && start < toMinutes(b.endTime) && end > toMinutes(b.startTime)
  );
  if (conflict) {
    return res.status(409).json({
      success: false,
      message: `${rooms[room].name} is already booked from ${conflict.startTime} to ${conflict.endTime} on ${date}. Please choose another time or room.`
    });
  }

  const booking = {
    id: "UHSL-" + String(nextId++).padStart(4, "0"),
    name, email, room, date, startTime, endTime,
    attendees: Number(attendees)
  };
  bookings[room].push(booking);

  res.status(201).json({ success: true, message: "Booking confirmed.", booking });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});