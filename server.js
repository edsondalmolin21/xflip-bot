const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("XFlip bot online 🚀");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("🔥 Mensagem recebida");
    console.log(JSON.stringify(req.body, null, 2));

    const mensagem =
      req.body.text?.message ||
      req.body.message ||
      req.body.data?.message ||
      "";

    const numero =
      req.body.phone ||
      req.body.data?.phone ||
      "";

    console.log("📩 Mensagem:", mensagem);
    console.log("📱 Número:", numero);

    return res.sendStatus(200);

  } catch (e) {
    console.log("❌ Erro:");
    console.log(e);

    return res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Rodando na porta ${PORT}`);
});