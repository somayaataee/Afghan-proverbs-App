
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const proverbsFilePath = path.join(__dirname, '../proverbsData.json');

function readProverbsFile() {
  try {
    const data = fs.readFileSync(proverbsFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function updateProverbsFile(data) {
  fs.writeFileSync(proverbsFilePath, JSON.stringify(data, null, 2));
}


// filter by category
router.get('/filter', (req, res) => {
  const category = req.query.category;
  const proverbsData = readProverbsFile();

  if (!category) {
    return res.render('filter', { proverbs: proverbsData, message: null });
  }

  const filtered = proverbsData.filter(p => p.category === category);
  if (filtered.length === 0) {
    return res.render('filter', { proverbs: [], message: 'ضرب المثلی با این کتگوری یافت نشد!' });
  }
  res.render('filter', { proverbs: filtered, message: null });
});

// random proverb
router.get('/random', (req, res) => {
  const proverbsData = readProverbsFile();

  if (proverbsData.length === 0) {
    return res.render('random', { proverb: null, message: 'هیچ ضرب المثلی موجود نیست!' });
  }
  const idx = Math.floor(Math.random() * proverbsData.length);
  const randomProverb = proverbsData[idx];
  res.render('random', { proverb: randomProverb, message: null });
});
//proverbs list
router.get('/', (req, res) => {
  const data = readProverbsFile();
  res.render('list', { proverbs: data });
});

router.get('/new', (req, res) => res.render('index'));

// post in to success page
router.post('/', (req, res) => {
  const data = readProverbsFile();
  const maxId = data.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newProverb = { id: maxId + 1, ...req.body };
  data.push(newProverb);
  updateProverbsFile(data);
  res.render('success', { proverb: newProverb });

});

//edit by id
router.get('/:id/edit', (req, res) => {
  const data = readProverbsFile();
  const proverb = data.find(p => p.id == req.params.id);
  if (!proverb) return res.send('Not found');
  res.render('edit', { proverb });
});

//patch
router.patch('/:id', (req, res) => {
  const data = readProverbsFile();
  const index = data.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    updateProverbsFile(data);
  }
  res.redirect('/proverbs');
});

//delete
router.delete('/:id', (req, res) => {
  let data = readProverbsFile();
  data = data.filter(p => p.id != req.params.id);
  updateProverbsFile(data);
  res.redirect('/proverbs');
});

export default router;
