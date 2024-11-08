const express = require('express');
const app = express();

const cibleList = [];

app.use(express.json());

app.get('/', async (req, res, next) => {
    res.send({ message: 'Backend du projet : Site Flm ' });
  });

app.post('/identify', (req, res) => {
    const { computer_name = 'Unknown' } = req.body;
    cibleList.push(computer_name);
    res.json({ message: `Request from computer: ${computer_name}`, cibleList });
});

app.get('/cibles', (req, res) => {
    res.json({ cibleList });
});

const PORT = 5000;

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
