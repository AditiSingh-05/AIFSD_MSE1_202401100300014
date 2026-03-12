require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Library Management API</title></head>
      <body>
        <h1>Library Management Backend</h1>
        <p>API to manage books for a university library.</p>
        <h2>Available Endpoints</h2>
        <ul>
          <li>POST /books - Add a new book</li>
          <li>GET /books - Get all books</li>
          <li>GET /books/:id - Get book by ID</li>
          <li>PUT /books/:id - Update book</li>
          <li>DELETE /books/:id - Delete book</li>
          <li>GET /books/search?title=&lt;query&gt; - Search by title (also supports author)</li>
        </ul>
      </body>
    </html>
  `);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  genre: { type: String, required: true },
  publisher: { type: String, required: true },
  publicationYear: { type: Number },
  totalCopies: { type: Number, required: true, min: 1 },
  availableCopies: { type: Number },
  shelfLocation: { type: String },
  bookType: { type: String, enum: ['Reference', 'Circulating'] },
  status: { type: String, default: 'Available' }
});

const Book = mongoose.model('Book', bookSchema);

app.post('/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    const saved = await book.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/books/search', async (req, res) => {
  try {
    const { title, author } = req.query;
    let query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    const books = await Book.find(query);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
