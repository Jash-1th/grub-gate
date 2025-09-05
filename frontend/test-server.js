import express from 'express';

const app = express();
const PORT = 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is working!' });
});

app.get('/', (req, res) => {
  res.send('<h1>Test Server Working!</h1>');
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
