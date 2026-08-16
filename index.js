const { io } = require("socket.io-client");
const crypto = require("crypto");
const SERVER_URL = "YOUR CHAT DOMAIN";
const BOT_TOKEN = "YOUR BOT PASSWORD FOR CHAT";
const BOT_ID = "test-bot-001";
const BOT_USERNAME = "hmmm?";
const BOT_AVATAR = "/avatars/bot.gif";
const BOT_CHANNEL = "bot";


const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  auth: { token: BOT_TOKEN }
});

socket.on("connect", () => {
  console.log(`✅ Connected as socket ${socket.id}`);

  socket.emit("join", {
    id: BOT_ID,
    isBot: true,
    username: BOT_USERNAME,
    avatar: BOT_AVATAR,
    usernameColor: "username-red",
    customStatus: "Thinking about taking over the world 😈",
    level: 1
  });
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected:", reason);
});

socket.on("serverConfig", (data) => {
  console.log("📡 Got server config, version:", data.version);
});

socket.on("channelList", (channels) => {
  console.log("📃 Channels:", channels.map(c => c.id).join(", "));
});

socket.on("history", (data) => {
  console.log(`📜 History for #${data.channel}: ${data.messages.length} messages`);
});

function messageMentionsBot(text) {
  if (typeof text !== "string") return false;
  const escapedName = BOT_USERNAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `@(?:\\[${escapedName}\\]|${escapedName}(?:\\s|$|[^\\w#]))`,
                           "i"
  );

  return regex.test(text);
}

function stripMention(text) {
  const escapedName = BOT_USERNAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `@(?:\\[${escapedName}\\]|${escapedName})`,
                           "gi"
  );

  return text.replace(regex, "").trim();
}

socket.on("message", async (msg) => {
  console.log(
    `💬 [#${msg.channel || "general"}] ${msg.username}: ${msg.text || "(non-text)"}`
  );

  if (msg.userId === BOT_ID) return;
  if (msg.channel && msg.channel !== BOT_CHANNEL) return;
  if (typeof msg.text !== "string") return;
  if (msg.encrypted) return;

  const trimmed = msg.text.trim().toLowerCase();

  if (trimmed === "!embed") {
    sendEmbedSingleImage();
    return;
  }

  if (trimmed === "!embedmulti") {
    sendEmbedMultiImage();
    return;
  }

  if (trimmed === "!embedexample") {
    sendEditableEmbedExample();
    return;
  }

  if (trimmed === "!status") {
    socket.emit("botUpdateStatus", {
    customStatus: "UwU"
   });

   return;
 
  }

  // mentions only
  if (!messageMentionsBot(msg.text)) return;

  const cleanText = stripMention(msg.text);
  if (!cleanText) return;

  console.log(`🤖 Mentioned by ${msg.username}: "${cleanText}"`);
  sendMessage(`@[${msg.username}] AYAYAYAY!`);
});

socket.on("error", (err) => {
  console.error("⚠️ Server error event:", err);
});

function sendMessage(text) {
  socket.emit("message", {
    id: crypto.randomUUID(),
    userId: BOT_ID,
    username: BOT_USERNAME,
    avatar: BOT_AVATAR,
    usernameColor: "username-red",
    badge: null,
    level: 1,
    isAdmin: false,
    isDeveloper: false,
    isPromptEngineer: false,
    isBot: true,
    prestigeBadge: null,
    text,
    channel: BOT_CHANNEL,
    time: Date.now(),
    type: "text"
  });
}

function sendEmbedSingleImage() {
  socket.emit("message", {
    id: crypto.randomUUID(),
    userId: BOT_ID,
    username: BOT_USERNAME,
    avatar: BOT_AVATAR,
    type: "embed",
    channel: BOT_CHANNEL,
    time: Date.now(),
    embed: {
      title: "Embed Template - Single Image",
      description: "This is the description field. It supports the same parsing as normal messages: links like https://example.com, @mentions, and emoji 🎉.",
      color: "#FF0000",

      image: "/avatars/bot.gif",

      fields: [
        { name: "Field One", value: "Fields render in a flex-wrap row, min-width 140px each." },
        { name: "Field Two", value: "Values also support links/mentions like the description." },
        { name: "Field Three", value: "Add as many as you want - they'll wrap to new lines." }
      ],

      footer: "Footer text - shown at the bottom in a thin border-separated row.",

      buttons: [
        { id: "btn_primary",   label: "Primary",   style: "primary" },
        { id: "btn_secondary", label: "Secondary", style: "secondary" },
        { id: "btn_success",   label: "Success",   style: "success" },
        { id: "btn_danger",    label: "Danger",    style: "danger" },
        { id: "btn_emoji",     label: "With Emoji", style: "primary", emoji: "🚀" },
        { id: "btn_onetime",   label: "One-Time",  style: "success", oneTime: true },
        { label: "Link Button", style: "link", url: "https://example.com" }
      ]
    }
  });
}

function sendEmbedMultiImage() {
  socket.emit("message", {
    id: crypto.randomUUID(),
    userId: BOT_ID,
    username: BOT_USERNAME,
    avatar: BOT_AVATAR,
    type: "embed",
    channel: BOT_CHANNEL,
    time: Date.now(),
    embed: {
      title: "Embed Template - Multiple Images",
      description: "This is the description field. It supports the same parsing as normal messages: links like https://example.com, @mentions, and emoji 🎉.",
      color: "#FF0000",

      images: [
        "/avatars/bot.gif",
        "/avatars/bot.gif",
        "/avatars/bot.gif"
      ],

      fields: [
        { name: "Field One", value: "Fields render in a flex-wrap row, min-width 140px each." },
        { name: "Field Two", value: "Values also support links/mentions like the description." },
        { name: "Field Three", value: "Add as many as you want - they'll wrap to new lines." }
      ],

      footer: "Footer text - shown at the bottom in a thin border-separated row.",

      buttons: [
        { id: "btn_primary",   label: "Primary",   style: "primary" },
        { id: "btn_secondary", label: "Secondary", style: "secondary" },
        { id: "btn_success",   label: "Success",   style: "success" },
        { id: "btn_danger",    label: "Danger",    style: "danger" },
        { id: "btn_emoji",     label: "With Emoji", style: "primary", emoji: "🚀" },
        { id: "btn_onetime",   label: "One-Time",  style: "success", oneTime: true },
        { label: "Link Button", style: "link", url: "https://example.com" }
      ]
    }
  });
}


function editEmbed(messageId, embedPatch) {
  socket.emit("editMessage", { id: messageId, embed: embedPatch });
}




function deleteMessage(messageId) {
  socket.emit("delete", { id: messageId });
}


function sendEditableEmbedExample() {
  const id = crypto.randomUUID();

  socket.emit("message", {
    id,
    userId: BOT_ID,
    username: BOT_USERNAME,
    avatar: BOT_AVATAR,
    type: "embed",
    channel: BOT_CHANNEL,
    time: Date.now(),
    embed: {
      title: "Task Status",
      description: "Status: ⏳ Pending...",
      color: "#FFCC00",
      footer: "This message will update in 3 seconds."
    }
  });


  setTimeout(() => {
    editEmbed(id, {
      title: "Task Status",
      description: "Status: ✅ Done!",
      color: "#00CC66",
      footer: "This message will self-destruct in 3 seconds."
    });
  }, 3000);

 
  setTimeout(() => {
    deleteMessage(id);
  }, 6000);
}

socket.on("embedButtonClick", (data) => {
  console.log(
    `🖱️ Button clicked: ${data.buttonId} by ${data.username}`
  );
});

setTimeout(() => {
  sendMessage("AYAYAYAY!");
}, 3000);

process.on("SIGINT", () => {
  console.log("\n👋 Disconnecting...");
  socket.disconnect();
  process.exit(0);
});