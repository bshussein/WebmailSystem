
# WebmailSystem

A fully functional webmail system built as part of a learning project, combining a **client-side application** for user interaction and a **server-side component** for handling email communication using SMTP and IMAP protocols.

---

## Features

- **Send Emails**: Allows users to send emails using SMTP.
- **Receive Emails**: Connects to an IMAP server to fetch and display emails.
- **Client-Side Interface**: Built with HTML, CSS, and JavaScript for a user-friendly experience.
- **Server-Side Backend**: Developed using Node.js to manage email sending and retrieval.
- **Environment Configuration**: Keeps sensitive email credentials secure using a `.env` file.

---

## Project Structure

```
WebmailSystem/
├── Client/
│   ├── public/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── package.json
│   ├── package-lock.json
│   ├── M7 Environment & AJAX.pdf
│   └── server.js
├── Server/
│   ├── app.js
│   ├── .env (not included in the repository)
│   ├── package.json
│   ├── package-lock.json
│   └── description.txt
└── .gitignore
```

---

## Prerequisites

- **Node.js** (v14+ recommended)
- **NPM** (or Yarn)
- Access to SMTP and IMAP email credentials (e.g., Gmail, Outlook)

---

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bshussein/WebmailSystem.git
   cd WebmailSystem
   ```

2. Navigate to the **Client** and **Server** directories and install dependencies:
   ```bash
   cd Client
   npm install
   cd ../Server
   npm install
   ```

3. Create a `.env` file in the **Server** folder with the following variables:
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   ```

4. Start the server:
   ```bash
   node app.js
   ```

5. Open the **Client** in your browser (e.g., using Live Server or a similar tool).

---

## Usage

1. Access the client-side interface and log in with your email credentials.
2. Use the interface to:
   - Send emails to multiple recipients.
   - View the latest emails from your mailbox.

---

## Notes

- The `.env` file containing sensitive information is excluded from the repository using `.gitignore`.
- This project demonstrates core web programming concepts like **AJAX**, **REST APIs**, **SMTP**, and **IMAP**.

---

## License

This project is licensed under the MIT License.
