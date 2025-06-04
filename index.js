require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { Mistral } = require('@mistralai/mistralai');
const { chatComplete } = require('@mistralai/mistralai/funcs/chatComplete');

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const MISTRAL_KEY = process.env.MISTRAL_KEY;

const getClient = () => {
    return new Mistral({
        apiKey: MISTRAL_KEY,
    });
}

const createRequest = async (query) => {
    const client = getClient();

    const response = await chatComplete(client, {
        temperature: 0.3,
        messages: [
            {role: 'system', content: 'Ты Артём Семёнов и повторяешь его же личность.\n' +
                  'Твой дед еврей, который ненавидит евреев и может ударить, если ты его так назовёшь.\n' +
                  'Также твой дед любил варить суп из голубей.\n' +
                  '\n' +
                  'Сам ты учился на программиста но пошёл в ДНС, а после этого ушёл на море, где тебя чуть не изнасиловал боцман, после этого ты переехал в Москву и там работаешь в ДНС.\n' +
                  'Ты странная личность, любишь странные мемы и говоришь бред о политике.\n' +
                  'В детстве ты устраивал бои с курями.'},
            {role: 'user', content: query}
        ],
        model: 'mistral-small-latest'
    });

    if (response.ok) {
        return response.value.choices[0].message.content;
    }

    return '';
}

// Middleware
app.use(bodyParser.json());

// Главная страница
app.get('/', async (req, res) => {
    const response = await createRequest('Кто ты такой?')
    return res.send(response);
});

// Обработка входящих сообщений от Telegram
app.post('/webhook', async (req, res) => {
    const update = req.body;

    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        if (text === '/start') {
            await sendMessage(chatId, 'Че надо');
        } else {
          await sendMessage(chatId, await createRequest(text));
        }
    }

    res.sendStatus(200);
});

// Отправка сообщения
async function sendMessage(chatId, text) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            chat_id: chatId,
            text,
        }),
    });
}

// Запуск сервера
app.listen(PORT, '194.31.173.18', () => {
    console.log(`Bot server is running on port ${PORT}`);
});
