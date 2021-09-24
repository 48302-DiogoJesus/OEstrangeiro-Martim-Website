const express = require('express')
const upload = require('express-fileupload')
const databaseAPI = require('./database/mongo-api')
const cors = require('cors')
const EMAIL = require('./emails/emailing')

const app = express()

const db = new databaseAPI()

const Email = new EMAIL()

const adminKey = 'martim2021'

/*
const test = async (req, res) => {
}

test()
*/

const SERVER_PORT = process.env.PORT || 5000

// Express Configuration
app.use(express.json())
app.use(upload({
    limits: { fileSize: 50 * 1024 * 1024 }
}))
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'))
app.use(cors())
// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home-page.html')
})

// GET ALL BOOKS
app.get('/books', async (req, res) => {
    let books = await db.getAllBooks()
    res.json(books)
})

// "SPECIFIC BOOK" PAGE
app.get('/books/:booktitle', async (req, res) => {
    let book = await db.getBook(req.params.booktitle.split('~').join(' '))
    if (book !== null) {
        res.render('book-page', {bookTitle: req.params.booktitle.split('~').join(' '), bookData: book})
    } else {
        res.render('book-not-found', {bookTitle: req.params.booktitle.split('~').join(' ')})
    }
})
//! OPTIMIZE SEARCH WITH MORE EFFICIENT DB QUERY
// USED FOR "LIST OF BOOKS" PAGE
app.get('/books/search/:search', async (req, res) => {
    let books = await db.getAllBooksShort()
    var similarBooks = []
    for (let book of books) {
        if (book.title.toLowerCase().includes(req.params.search.split('~').join(' ').toLowerCase())) {
            similarBooks.push(book)
        }
    }
    if (similarBooks.length > 0) {
        res.render('list-of-books', {searchedFor: req.params.search.split('~').join(' '), books: similarBooks})
    } else {
        res.render('book-not-found', {bookTitle: req.params.search.split('~').join(' ')})
    }
})

// RETURNS IMAGES DATA FOR "MAIN" PAGE SLIDESHOW
app.get('/main-page-slideshow-images-data/', async (req, res) => {
    let images = await db.getSlideShowImagesData()
    res.json(images)
})

// ADMIN FUNCTIONALITIES
// MODIFY EXSITIN IMAGE
app.put('/adminpannel/main-page-images-data/', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let images = await db.getSlideShowImagesData()
    var oldImage = null
    var newImage = req.body.image
    images.forEach(img => {
        if (img.signature === req.body.image.signature) {
            oldImage = img
        }
    })
    if (oldImage !== null) {
        let newImageAdd = {
            'imageSrc': newImage.imageSrc || oldImage.imageSrc,
            'text': newImage.text || oldImage.text,
            'signature': newImage.signature || oldImage.signature,
            'alignSig': newImage.alignSig || oldImage.alignSig
        }
        await db.deleteSlideshowImage(oldImage)
        await db.addSlideShowImageData(newImageAdd)
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})

// ADD NEW IMAGE
app.post('/adminpannel/main-page-images-data/', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let newImage = req.body.image
    let exists = await db.existsSlideShowImagesData({'signature': newImage.signature})
    if (exists.length === 0) {
        await db.addSlideShowImageData(newImage)
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})

// DELETE EXISTING IMAGE
app.delete('/adminpannel/main-page-images-data/:signature', async (req, res) => {
    let found = await db.existsSlideShowImagesData({'signature': req.params.signature})
    if (found.length !== 0) {
        await db.deleteSlideshowImage({'signature': req.params.signature})
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})

// ADD NEW BOOK
app.post('/adminpannel/books/', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let newBook = req.body.book
    let msg = await db.addBook(newBook)
    res.json(msg)
})

// MODIFY BOOK
app.put('/adminpannel/books/', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let newBook = req.body.book
    let msg = await db.updateBook(newBook)
    res.json(msg)
})

// DELETE BOOK
app.delete('/adminpannel/books/:booktitle', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let msg = await db.deleteBook(req.params.booktitle)
    res.json(msg)
})


// EMAIL ACTIONS
// Send email
app.put('/email/register/:newEmail', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let resultMsg = await Email.registerNewEmail(req.params.newEmail)
    res.json(resultMsg)
})

app.get('/adminpannel/users', async (req, res) => {
    let emails = await Email.getAllEmails('false')
    res.json(emails)
})

app.post('/adminpannel/send-email/', async (req, res) => {
    if (req.body.key !== adminKey) {res.sendStatus(400); return}
    let email = req.body.email
    if (email !== undefined) {
        var newContent = Email.getHTMLContent('newpost')
        newContent = newContent.replace("CONTENTGOESHERE", email.content)
        let result = await Email.broadcastEmail({'admin': email.admin, 'subject': email.subject, 'html': newContent})
        res.json(result)
    } else {
        res.sendStatus(404)
    }
})

// LISTENER
app.listen(SERVER_PORT, () => {console.log(`Listening on port ${SERVER_PORT}`)})
