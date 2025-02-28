const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// ⚡ Configuration du serveur Express + WebSocket
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ⚡ Servir le fichier index.html et les fichiers statiques
app.use(express.static(__dirname));

// ⚡ Connexion au port série de l'Arduino
const port = new SerialPort({ path: 'COM7', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// ⚡ Fonction pour interpréter les données de l'Arduino
function interpreterDonnees(data) {
    if (data.includes("Ouverture")) {
        return "OUVERT";
    } else if (data.includes("Fermeture")) {
        return "FERMÉ";
    }
    return "INCONNU"; // Si les données ne correspondent à rien
}

// ⚡ Quand une connexion WebSocket est établie
wss.on('connection', (ws) => {
    console.log("Un client s'est connecté.");

    parser.on('data', (data) => {
        console.log("Données brutes reçues de l'Arduino :", data); // Debug
        const etatBarriere = interpreterDonnees(data);
        console.log("Interprété comme :", etatBarriere);
        ws.send(etatBarriere);
    });

    ws.on('close', () => {
        console.log("Un client s'est déconnecté.");
    });
});

// ⚡ Lancer le serveur sur le port 3000
server.listen(3000, () => {
    console.log('Serveur WebSocket en écoute sur http://localhost:3000');
});
