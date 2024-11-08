const express = require('express');
const app = express();

const cibleList = [];

app.use(express.json());

app.post('/identify', (req, res) => {
    const { computer_name = 'Unknown' } = req.body;
    cibleList.push(computer_name);
    res.json({ message: `Request from computer: ${computer_name}`, cibleList });
});

app.get('/cibles', (req, res) => {
    res.json({ cibleList });
});

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
