const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://oestrangeiro:oestrangeiroadminpass@cluster0.suozx.mongodb.net/OEstrangeiro?retryWrites=true&w=majority'
const client = new MongoClient(uri)
const books = client.db('OEstrangeiro').collection('books-data')
const slideshowImgs = client.db('OEstrangeiro').collection('main-page-slideshow-images-data')

/* 
*DATABASE ACTIONS*
? BOOK EXISTS ??
? RETREIVE BOOK INFORMATION
? UPDATE BOOK INFOMATION
*/

// imageSrc is optional
const requiredFields = [
    'title',
    'author',
    'publicationDate',
    'reflection',
    'reflectionAuthor'
]

const delay = s => new Promise(resolve => setTimeout(resolve, s*1000))

module.exports = class DB {
    
    // BOOKS
    async getAllBooksShort() {
        await client.connect()
        delay(1)
        return books.find({}).toArray().then(books => {
            let booksTitles = []
            for (let book of books) {
                booksTitles.push({'imageSrc': book.imageSrc, 'title':book.title,'author': book.author, 'publicationDate': book.publicationDate})
            }
            delay(5)
            return booksTitles
        })
    }

    // BOOKS
    async getAllBooks() {
        await client.connect()
        let booksList = await books.find({}).toArray()
        return booksList
    }

    async getBook(bookTitle) {
        await client.connect()
        let book = await books.findOne({'title': bookTitle})
        client.close()
        return book
    }

    async addBook(newBook) {
        if (this.validBook(newBook)) {
            await client.connect()
            let book = await books.findOne({'title': newBook.title})
            if (book === null) {           
                books.insertOne({
                    title: newBook.title, 
                    author: newBook.author, 
                    publicationDate: newBook.publicationDate, 
                    reflection: newBook.reflection, 
                    reflectionAuthor: newBook.reflectionAuthor,
                    imageSrc: newBook.imageSrc === undefined ? '' : newBook.imageSrc
                })
                return 'AddBook: New book has been added successfully!'
            } else {
                return 'AddBook: A book with that title is already registred!'
            }
        } else {
            return 'That book does not contain all the required fields!'
        }
    }

    async updateBook(updatedBook) {
        await client.connect()
        let book = await books.findOne({'title': updatedBook.title})
        if (book !== null) {
            let oldBook = book
            books.deleteOne({title: updatedBook.title}, () => {
                books.insertOne({             
                    'imageSrc': updatedBook.imageSrc || oldBook.ImageSrc,
                    'title': updatedBook.title || oldBook.title,
                    'author': updatedBook.author || oldBook.author,
                    'publicationDate': updatedBook.publicationDate || oldBook.publicationDate,
                    'reflection': updatedBook.reflection || oldBook.reflection,
                    'reflectionAuthor': updatedBook.reflectionAuthor || oldBook.reflectionAuthor
                })
            })
            return 'UpdateBook: The book has been updated successfully!'
        } else {
            return `UpdateBook: There is no book registred with that title: ${updatedBook.title}`
        }
    }

    async deleteBook(bookTitle) {
        await client.connect()
        let result = await books.findOneAndDelete({'title': bookTitle})
        let found = await books.findOne({'title': bookTitle})
        if (found === null) {
            return 'That book was removed with success!'
        } else {
            return 'Could not remove that book!'
        }
    }

    validBook(book) {
        var c = 0
        for (let key of Object.keys(book)) {
            if (requiredFields.includes(key) && book[key] !== '') {
                c++
            }
        }
        return c !== requiredFields.length ? false : true
    }

    // MAIN PAGE SLIDESHOW IMAGES
    async getSlideShowImagesData() {
        await client.connect()
        return slideshowImgs.find({}).toArray().then(images => {
            let imgs = images
            return imgs
        })
    }

    async existsSlideShowImagesData(imageData) {
        await client.connect()
        return slideshowImgs.find(imageData).toArray().then(image => {
            let img = image
            return img
        })
    }

    async addSlideShowImageData(newImageData) {
        await client.connect()
        await slideshowImgs.insertOne(newImageData)
        client.close()
    }

    async deleteSlideshowImage(imageData) {
        await client.connect()
        await slideshowImgs.findOneAndDelete(imageData)
        client.close()
    }
}