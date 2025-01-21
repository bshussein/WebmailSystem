// Event listener for form submission (triggered whenever "send email" is pressed)
document.getElementById("composeForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevents browser from reloading the page when submitted
  
    // Get form values
    const to = document.getElementById("to").value;
    const cc = document.getElementById("cc").value;
    const bcc = document.getElementById("bcc").value;
    const subject = document.getElementById("subject").value;
    const text = document.getElementById("body").value;
  
    // Send the email via AJAX
    sendEmail(to, cc, bcc, subject, text);
  });
  
  // Function to send email
  function sendEmail(to, cc, bcc, subject, text) {
    fetch("http://localhost:4000/send-email", { // send POST request to the backend endpoint (M6)
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, cc, bcc, subject, text }), // send content as a JSON string
    })
      .then((response) => response.json()) // Process the server's response 
      .then((data) => {
        console.log("Email sent:", data); // Log success message
        alert("Email sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Error sending email!"); // Log error message
      });
  }
  
  // Function to fetch list of mailboxes from the server
  // Send GET request to backend endpoint (/mailboxes)
  function fetchMailboxes() {
    fetch("http://localhost:4000/mailboxes")
      .then((response) => response.json()) // Process server's response
      .then((data) => {
        const mailboxesContainer = document.getElementById("mailboxes"); // Where the mailboxes is displayed
        data.forEach((mailbox) => {
          const listItem = document.createElement("li"); // List item for each mailbox
          listItem.textContent = mailbox; // set name of the mailbox
          mailboxesContainer.appendChild(listItem); // add mailbox to the page
        });
      })
      .catch((error) => {
        console.error("Error fetching mailboxes:", error);
        alert("Error fetching mailboxes!");
      });
  }
  
  // Function to fetch inbox messages from a specific mailbox
  function fetchInbox(mailbox) {
    fetch(`http://localhost:4000/mailboxes/${mailbox}`) // Call the server's route
      .then((response) => response.json())
      .then((data) => {
        const inboxContainer = document.getElementById("inbox");
        inboxContainer.innerHTML = ""; // Clear previous messages
  
        if (data.messages.length === 0) {
          // If no messages, show a placeholder message
          inboxContainer.innerHTML = "<p>No messages in this mailbox.</p>";
          return;
        }
  
        // Display the fetched messages
        data.messages.forEach((message) => {
          const listItem = document.createElement("li");
          listItem.textContent = `From: ${message.from}, Subject: ${message.subject}`;
          inboxContainer.appendChild(listItem);
        });
      })
      .catch((error) => {
        console.error("Error fetching inbox messages:", error);
        alert("Error fetching inbox messages!");
      });
  }
  
  // Fetch mailboxes when the page loads
  window.onload = fetchMailboxes;
  
  // Track the currently selected mailbox
  let currentlySelectedMailbox = null;
  
  // Event listener for clicking mailboxes
  document.getElementById("mailboxes").addEventListener("click", function (event) {
    const mailbox = event.target.textContent; // Get the clicked mailbox name
    const inboxContainer = document.getElementById("inbox"); // Inbox container for messages
  
    // If the same mailbox is clicked, toggle its visibility
    if (currentlySelectedMailbox === mailbox) {
      inboxContainer.innerHTML = ""; // Clear the messages
      currentlySelectedMailbox = null; // Reset the currently selected mailbox
    } else {
      // Fetch messages for the newly selected mailbox
      currentlySelectedMailbox = mailbox; // Update the selected mailbox
      fetchInbox(mailbox); // Call fetchInbox to retrieve and display messages
    }
  });
  
  
