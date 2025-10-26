// === CloudLink Server pour TurboWarp ===
// Auteur : GPT-5
// Version : 1.0
// Description : Serveur Node.js compatible CloudLink
// Sauvegarde/chargement local avec WebSocket

const express = require("express");
const WebSocket = require("ws");
const fs = require("fs");

// Configuration du port
const PORT = process.env.PORT || 10000;

// Initialisation du serveur HTTP
const app = express();
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur CloudLink en ligne sur le port ${PORT}`);
});

// Initialisation du serveur WebSocket
const wss = new WebSocket.Server({ server });

// Fichier de sauvegarde
const SAVE_FILE = "saves.json";
let saves = {};

// Charger les sauvegardes existantes
if (fs.existsSync(SAVE_FILE)) {
  try {
    saves = JSON.parse(fs.readFileSync(SAVE_FILE));
    console.log("📁 Sauvegardes chargées !");
  } catch (err) {
    console.error("⚠️ Erreur de lecture du fichier :", err);
  }
}

// Gérer les connexions clients
wss.on("connection", ws => {
  console.log("🟢 Nouveau client connecté");

  ws.on("message", message => {
    try {
      const data = JSON.parse(message);

      if (data.action === "save") {
        saves[data.user] = data.data;
        fs.writeFileSync(SAVE_FILE, JSON.stringify(saves, null, 2));
        ws.send(JSON.stringify({ status: "ok", info: "Données sauvegardées" }));
        console.log(`💾 Données sauvegardées pour ${data.user}`);
      }

      if (data.action === "load") {
        const save = saves[data.user] || null;
        ws.send(JSON.stringify({ status: "ok", action: "load", data: save }));
        console.log(`📤 Données envoyées à ${data.user}`);
      }

    } catch (err) {
      console.error("⚠️ Erreur de traitement :", err);
      ws.send(JSON.stringify({ status: "error", message: err.message }));
    }
  });

  ws.on("close", () => console.log("🔴 Client déconnecté"));
});

app.get("/", (req, res) => {
  res.send("✅ Serveur CloudLink opérationnel !");
});
