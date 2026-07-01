# 💬 Chat UI

A chat interface demonstrating `append()`, auto-scroll, form reset, and a realistic message layout.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

    #chat {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      flex-shrink: 0;
      padding: 14px 16px;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #007aff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 15px;
      flex-shrink: 0;
    }

    .contact-info { line-height: 1.3; }
    .contact-name { font-weight: 600; font-size: 15px; }
    .contact-status { font-size: 12px; color: #34c759; }

    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 15px;
      line-height: 1.4;
      word-break: break-word;
    }

    .message.received {
      background: #f0f0f0;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }

    .message.sent {
      background: #007aff;
      color: white;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }

    .message-time {
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.6;
      text-align: right;
    }

    .message.received .message-time { text-align: left; }

    .compose-bar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-top: 1px solid #e8e8e8;
      background: #fff;
    }

    .compose-bar input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      font-size: 15px;
      outline: none;
      font-family: inherit;
    }

    .compose-bar input:focus { border-color: #007aff; }

    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #007aff;
      color: white;
      border: none;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .send-btn:active { opacity: 0.7; }
    .typing { color: #888; font-size: 13px; font-style: italic; align-self: flex-start; }
  </style>
</head>
<body>

<app>
  <page name="chat" id="chat" oncreate="initChat">
    <div class="chat-header">
      <div class="avatar">A</div>
      <div class="contact-info">
        <div class="contact-name">Alice</div>
        <div class="contact-status">Online</div>
      </div>
    </div>

    <div class="message-list" id="messages"></div>

    <form action="sendMessage" class="compose-bar">
      <input name="text" type="text" placeholder="Message" autocomplete="off">
      <button type="submit" class="send-btn">↑</button>
    </form>
  </page>
</app>

<script src="clera.js"></script>
<script>
  const initialMessages = [
    { from: "received", text: "Hey! How's the project going?", time: "10:12" },
    { from: "sent",     text: "Pretty well! Just finishing up the UI.",   time: "10:13" },
    { from: "received", text: "Nice. Let me know when it's ready to review.", time: "10:13" },
    { from: "sent",     text: "Will do. Should be later today.",           time: "10:14" },
  ];

  function initChat(context) {
    // Render initial messages
    context.render("#messages", initialMessages.map(messageHtml).join(""));
    scrollToBottom();
  }

  function sendMessage(context) {
    const text = context.values.text.trim();
    if (!text) return;

    context.resetForm();

    // Append the sent message
    context.append("#messages", messageHtml({ from: "sent", text, time: now() }));
    scrollToBottom();

    // Simulate a reply after a short delay
    simulateReply(context, text);
  }

  function simulateReply(context, sentText) {
    // Show typing indicator
    context.append("#messages", `<div class="typing" id="typing">Alice is typing...</div>`);
    scrollToBottom();

    setTimeout(() => {
      // Remove typing indicator
      const typingEl = document.getElementById("typing");
      if (typingEl) typingEl.remove();

      const replies = [
        "Got it, thanks!",
        "Makes sense.",
        "Sounds good to me.",
        "Let me check and get back to you.",
        "Nice one! 👍"
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      context.append("#messages", messageHtml({ from: "received", text: reply, time: now() }));
      scrollToBottom();
    }, 1200);
  }

  function messageHtml({ from, text, time }) {
    return `
      <div>
        <div class="message ${from}">${text}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
  }

  function scrollToBottom() {
    const list = document.getElementById("messages");
    if (list) list.scrollTop = list.scrollHeight;
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
</script>

</body>
</html>
```

---

## What this demonstrates

- `oncreate` for initial message load
- `context.append()` for adding messages without clearing history
- `context.resetForm()` to clear the compose input
- Auto-scroll after every append
- Simulated typing indicator using a timed `append` + manual DOM removal
- `context.values.text` for reading the message input
- Flex column page layout with fixed header, scrollable body, fixed footer

---

## Next

[09 Production](../09-production/01-production-readiness.md)
