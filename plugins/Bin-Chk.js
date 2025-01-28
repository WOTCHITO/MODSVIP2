const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// Crear una instancia del cliente
const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('ready', () => {
    console.log('El bot está listo para usar.');
});

// Cargar todos los comandos dinámicamente desde la carpeta 'commands'
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

// Leer todos los archivos .js dentro de la carpeta commands
fs.readdirSync(commandsPath).forEach((file) => {
    if (file.endsWith('.js')) {
        const commandName = file.replace('.js', ''); // El nombre del comando (sin extensión)
        const handler = require(path.join(commandsPath, file)); // Cargar el archivo
        commands.set(commandName, handler); // Guardarlo en el mapa de comandos
    }
});

// Escuchar mensajes entrantes
client.on('message', async (message) => {
    if (message.body.startsWith('/')) {
        // Separar el comando y los argumentos
        const args = message.body.slice(1).split(' ');
        const command = args[0]; // Nombre del comando (sin el prefijo '/')

        const handler = commands.get(command); // Buscar el handler correspondiente

        if (handler) {
            try {
                await handler(message, args.slice(1)); // Ejecutar el handler con argumentos
            } catch (error) {
                console.error(`Error al ejecutar el comando /${command}:`, error);
                await message.reply('Ocurrió un error al ejecutar tu comando.');
            }
        } else {
            await message.reply('Comando no reconocido. Usa /help para ver la lista de comandos.');
        }
    }
});

// Iniciar el cliente
