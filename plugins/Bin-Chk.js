const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

// Crear una instancia del cliente
const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('ready', () => {
    console.log('El bot está listo para usar.');
});

client.on('message', async (message) => {
    if (message.body.startsWith('/chk')) {
        const parts = message.body.split(' ');
        if (parts.length !== 2) {
            await message.reply('Por favor, usa el formato correcto: /chk <número_de_tarjeta>');
            return;
        }

        const cardNumber = parts[1];
        const apiUrl = `https://minos.alwaysdata.net/gates/b3.php?cc=${cardNumber}`;
        const binInfoUrl = `https://binlist.io/lookup/${cardNumber.slice(0, 6)}/`;

        try {
            // Solicitud a la API para obtener información de la tarjeta
            const apiResponse = await axios.get(apiUrl);
            const { card = 'No disponible', status = 'No disponible', response: responseMessage = 'No disponible' } = apiResponse.data;

            // Solicitud a la API de BIN
            const binResponse = await axios.get(binInfoUrl);
            const binData = binResponse.data;
            const brand = binData.scheme || 'No disponible';
            const lv = binData.type || 'No disponible';
            const typ = binData.category || 'No disponible';
            const country = (binData.country && binData.country.name) || 'No disponible';
            const flag = (binData.country && binData.country.emoji) || 'No disponible';
            const bank = (binData.bank && binData.bank.name) || 'No disponible';

            // Formatear el mensaje de respuesta
            const resultMessage = `
B3 AUTH
-------------------------------------------------------
[ϟ] Cc:: ${card}
[ϟ] Status: ${status}
[ϟ] Response: ${responseMessage}

[ϟ] Info ${brand} - ${lv} - ${typ}
[ϟ] Bank: ${bank}
[ϟ] Country: ${country} - ${flag}

[ϟ] Req: ${message.from}
-------------------------------------------------------
Bot by @EDER.JS.
`;

            // Enviar el resultado al chat de WhatsApp
            await message.reply(resultMessage);
        } catch (error) {
            await message.reply(`Error al conectar con la API: ${error.message}`);
        }
    }
});

// Iniciar el cliente
client.initialize();
