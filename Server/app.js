const express = require("express"); // Framework to create web apps and APIs
const nodemailer = require("nodemailer"); // module for sending emails using SMTP
const dotenv = require("dotenv"); // Import for email credintials 
const Imap = require("node-imap"); // Connect IMAP server to retrieve emails 
const quotedPrintable = require("quoted-printable"); // Import to decode email content that is quoted-printable decoder
const cors = require("cors"); // Import the cors middleware

require('dotenv').config();

// Load environment variables
dotenv.config();

const app = express(); // Handle HTTP requests 
const PORT = 4000;

// Middleware to parse JSON data (middleware converts it into JavaScript)
app.use(express.json());

// Enable CORS for client-side requests
app.use(
    cors({
      origin: "http://localhost:5000", // Allow requests from your client-side origin
    })
);

// Nodemailer SMTP setup (for sending emails)
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Fetched from environment variable
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// IMAP client setup (for receiving and managing emails)
const imapOptions = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: "imap.gmail.com", // IMAP server (Gmail)
  // Both TLS and SSL protect email data transmission 
  port: 993, // SSL port (used by GMAIL for IMAP conecctions) 
  tls: true, // Use (Transport Layer Security) encryption 
  authTimeout: 30000,
};

let imapClient;

// Connect to IMAP server (using node-imap)
function connectIMAP() {
  imapClient = new Imap(imapOptions);

  imapClient.once("ready", () => {
    console.log("Connected to IMAP server");
  });

  imapClient.once("error", (error) => {
    console.error("IMAP connection error:", error);
  });

  imapClient.connect();
}

// check if the server is running
app.get("/", (req, res) => {
  res.send("Webmail Server is Running!");
});

// Send email route (SMTP)
app.post("/send-email", async (req, res) => {
  const { to, cc, bcc, subject, text } = req.body;

  try {
    const info = await smtpTransporter.sendMail({
      from: `"Webmail System" <${process.env.EMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject,
      text,
    });

    res.status(200).json({
      message: "Email sent successfully with CC/BCC!",
      info,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending email",
      error: error.message,
    });
  }
});

// Connect to IMAP server (at startup)
connectIMAP();

// List all mailboxes (IMAP) (mailbox names)
app.get("/mailboxes", async (req, res) => {
    try {
      if (!imapClient) {
        await connectIMAP();
      }
  
      imapClient.getBoxes((error, boxes) => {
        if (error) {
          console.error("Error fetching mailboxes:", error);
          res.status(500).json({ message: "Error listing mailboxes", error: error.message });
        } else {
          // Filter out unwanted folders
          const mailboxNames = Object.keys(boxes).filter(
            (name) => !name.startsWith("[") // Exclude unwanted folders like [Gmail]
          );
          res.status(200).json(mailboxNames);
        }
      });
    } catch (error) {
      console.error("Error in /mailboxes route:", error.message);
      res.status(500).json({ message: "Error retrieving mailboxes", error: error.message });
    }
  });  

// List messages in a mailbox (IMAP) with a limit (Last 10 messages)
app.get("/mailboxes/:mailbox", async (req, res) => {
  const { mailbox } = req.params; // Get the mailbox name from the request
  const limit = 10; // Limit to the last 10 messages

  try {
    // Open the specified mailbox
    imapClient.openBox(mailbox, false, (error, box) => {
      if (error) {
        // Handle errors while opening the mailbox
        console.error(`Error opening mailbox "${mailbox}":`, error.message);
        res.status(500).json({ message: `Error opening mailbox "${mailbox}"`, error: error.message });
        return;
      }

      // Check if the mailbox is empty
      if (box.messages.total === 0) {
        console.log(`Mailbox "${mailbox}" is empty.`);
        res.status(200).json({ messages: [] }); // Return an empty list if there are no messages
        return;
      }

      // Calculate the range of messages to fetch
      const startMessage = Math.max(box.messages.total - limit + 1, 1); // Ensure it doesn't go below 1
      const endMessage = box.messages.total; // Fetch messages up to the total number of messages

      const fetch = imapClient.fetch(`${startMessage}:${endMessage}`, {
        bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)", // Retrieve only the message headers
      });

      let messages = []; // Array to store fetched messages

      // Listen for fetched messages
      fetch.on("message", (msg, seqno) => {
        let message = {};
        msg.on("body", (stream) => {
          let body = "";
          stream.on("data", (chunk) => {
            body += chunk.toString(); // Accumulate the message body
          });

          stream.on("end", () => {
            // Parse the headers to extract relevant fields
            const headers = body.split("\r\n");
            headers.forEach((header) => {
              if (header.startsWith("From:")) message.from = header.slice(5).trim();
              if (header.startsWith("Subject:")) message.subject = header.slice(9).trim();
              if (header.startsWith("Date:")) message.date = header.slice(5).trim();
            });
            message.id = seqno; // Add the message ID (seqno) to the message object
          });
        });

        msg.once("end", () => {
          messages.push(message); // Add the parsed message to the array
        });
      });

      fetch.once("end", () => {
        console.log(`Done fetching messages from mailbox "${mailbox}".`);
        res.status(200).json({ messages }); // Send the fetched messages as the response
      });

      fetch.once("error", (fetchError) => {
        // Handle errors during the fetching of messages
        console.error(`Error fetching messages from mailbox "${mailbox}":`, fetchError.message);
        res.status(500).json({ message: `Error fetching messages from mailbox "${mailbox}"`, error: fetchError.message });
      });
    });
  } catch (error) {
    // Handle unexpected errors
    console.error(`Unexpected error in /mailboxes/:mailbox route:`, error.message);
    res.status(500).json({ message: "Unexpected error retrieving messages", error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
