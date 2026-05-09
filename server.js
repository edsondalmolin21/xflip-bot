const express = require("express");
const axios = require("axios");
require("dotenv").config();
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const SYSTEM_PROMPT = `
Você é um assistente da plataforma Xflip.

Responda sempre em JSON:

{
  "acao": "cadastrar" | "buscar" | "duvida",
  "dados": {}
}
`;

app.post("/webhook", async (req, res) => {
  try {
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

    if (!mensagem) return res.sendStatus(200);

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: mensagem },
      ],
    });

    let resposta;

    try {
      resposta = JSON.parse(ai.choices[0].message.content);
    } catch {
      await enviarMensagem(numero, "Não entendi 😅");
      return res.sendStatus(200);
    }

    if (resposta.acao === "cadastrar") {
      await supabase.from("imoveis").insert(resposta.dados);
      await enviarMensagem(numero, "Imóvel cadastrado ✅");
    }

    if (resposta.acao === "buscar") {
      const { data } = await supabase.from("imoveis").select("*").limit(3);

      let texto = "🏠 Imóveis:\n";
      data.forEach(i => {
        texto += `${i.nome} - R$ ${i.valor}\n`;
      });

      await enviarMensagem(numero, texto);
    }

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Rodando na porta ${PORT}`);
});