const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("XFlip bot online ??");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook recebido:");
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

    console.log("Mensagem:", mensagem);
    console.log("Número:", numero);

    if (!mensagem) {
      return res.sendStatus(200);
    }

    await enviarMensagem(numero, "Olá ?? Recebi sua mensagem!");

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

async function enviarMensagem(numero, texto) {
  await axios.post(
    `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`,
    {
      phone: numero,
      message: texto,
    }
  );
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`?? Rodando na porta ${PORT}`);
});