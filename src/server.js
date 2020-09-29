import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (request, response) => {
  console.log("Hullow");
  return response.json({ "hello": "world"});
});

app.listen(3333);
