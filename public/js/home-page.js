const $ = document
//! SPACES ARE '-' IN ORIGINAL FILE
const musicName = 'Ambient-Music.mp3'

//*-------------------------- BOOK CARDS PREVIEW -------------------------*//
$.addEventListener('DOMContentLoaded', async () => {
    const leftArrow = $.getElementsByClassName('arrow-left')[0]
    const rightArrow = $.getElementsByClassName('arrow-right')[0]
    var books
    var pointer = 0
    await fetch('/books').then(res => res.json()).then(booksList => {
        books = booksList
    })
    for (let book of books.slice(0, 3)) {
        let newBook = $.createElement('div')
        newBook.className = 'card'
        newBook.innerHTML = `
        <div>${books.indexOf(book)+1}</div>
        <h2>"${book.title}"</h2>
        <span>Author : <l style="font-style: italic;">${book.author}</l></span>
        <p>${book.reflection.substring(0,220)}.....</p>
        <signed>${book.reflectionAuthor}</signed>
        <tip>Clica para ler a postagem completa...</tip>
        `
        newBook.addEventListener('click', () => {
            window.location.href = `/books/${book.title}`
        })
        $.getElementsByClassName('cards-grid')[0].appendChild(newBook)
    }
    leftArrow.addEventListener('click', () => {
        if (pointer !== 0) {
            pointer--
            $.getElementsByClassName('cards-grid')[0].innerHTML = '' 
            for (let book of books.slice(pointer, pointer + 3)) {
                let newBook = $.createElement('div')
                newBook.className = 'card'
                newBook.innerHTML = `
                <div>${books.indexOf(book)+1}</div>
                <h2>"${book.title}"</h2>
                <span>Author : <l style="font-style: italic;">${book.author}</l></span>
                <p>${book.reflection.substring(0,220)}.....</p>
                <signed>${book.reflectionAuthor}</signed>
                <tip>Clica para ler a postagem completa...</tip>
                `
                newBook.addEventListener('click', () => {
                    window.location.href = `/books/${book.title}`
                })
                $.getElementsByClassName('cards-grid')[0].appendChild(newBook)
            }
        }
    })
    rightArrow.addEventListener('click', () => {
        if (pointer + 3 < books.length - 1) {
            pointer++
            $.getElementsByClassName('cards-grid')[0].innerHTML = ''
            for (let book of books.slice(pointer, pointer + 3)) {
                let newBook = $.createElement('div')
                newBook.className = 'card'
                newBook.innerHTML = `
                <div>${books.indexOf(book)+1}</div>
                <h2>"${book.title}"</h2>
                <span>Author : <l style="font-style: italic;">${book.author}</l></span>
                <p>${book.reflection.substring(0,220)}.....</p>
                <signed>${book.reflectionAuthor}</signed>
                <tip>Clica para ler a postagem completa...</tip>
                `
                newBook.addEventListener('click', () => {
                    window.location.href = `/books/${book.title}`
                })
                $.getElementsByClassName('cards-grid')[0].appendChild(newBook)
            }
        }
    })
})

//*-------------------------- EMAIL REGISTER -------------------------*//

const registerEmail = () => {
    let email = $.getElementById('email-input').value
    if (email === '') {alert('Endereço Inválido');return}
    fetch(`/email/register/${email}`, {method: 'PUT'}).then(res => res.json()).then(message => {
        $.getElementsByClassName('join-text')[0].innerText = message
        $.getElementById('email-input').value = ''
    })
}
//*-------------------------- AUDIO CONTROLLS -------------------------*//

const musicPlayButton = $.getElementsByClassName('play-button')[0]
const audio = $.getElementsByTagName('audio')[0]
const musicNameLabel = $.getElementsByClassName('music-player')[0].getElementsByTagName('p')[0]

audio.src = `./audio/${musicName}`
audio.volume = '.04'
musicNameLabel.innerText = musicName.split('.').slice(0, -1).join('.').split('-').join(' ')

var isPlaying = false

musicPlayButton.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true
        audio.play()
        musicPlayButton.innerHTML = '<i class="fas fa-pause fa-2x"></i>'
    } else {
        isPlaying = false
        audio.pause()
        musicPlayButton.innerHTML = '<i class="fas fa-play fa-2x"></i>' 
    }
})

//*-------------------------- MOBILE RESPONSIVE MENU -------------------------*//

const expandButton = $.getElementsByClassName('expand-menu-mobile')[0]

const header = $.getElementsByTagName('header')[0]
const headerUl = header.getElementsByTagName('ul')[0]
const headerNav = header.getElementsByTagName('nav')[0]
const headerSvg = header.getElementsByClassName('instagram-icon')[0]
const headerIcon = header.getElementsByClassName('icon logo')[0]
const searchIcon = header.getElementsByClassName('search-icon')[0]

const defaultButton = expandButton.style
const defaultHeader = header.style
const defaultUl = headerUl.style
const defaultNav = headerNav.style
const defaultSvg = headerSvg.style
const defaultIcon = headerIcon.style

window.addEventListener('resize', () => {
    if (window.innerWidth > 976) {
        hideMobileMenu()
        headerIcon.style.height = '80px'
    } else if (window.innerWidth <= 976 && headerIcon.style.height !== '80px') {
        headerIcon.style.height = 'none'
    }
})

expandButton.addEventListener('click', () => {
    if (header.style.fontSize !== '0.9rem') {
        showMobileMenu()
    } else {
        hideMobileMenu()
    }
})

const showMobileMenu = () => {
    headerIcon.style.height = '80px';
    headerIcon.style.paddingRight = '20px';
    expandButton.style.transform = 'rotate(180deg)';
    headerSvg.style.marginRight = 0;
    headerNav.style.display = 'flex';
    headerNav.style.flexDirection = 'column';
    header.style.fontSize = '0.9rem';
    header.style.flexDirection = 'column';
    header.style.padding = '0 0 25px 0';
    header.style.height = '670px';
    headerUl.style.flexDirection = 'column';
    headerUl.style.padding = 0;
    searchIcon.style.display = "flex"
    headerUl.style.marginTop = 0;
}

const hideMobileMenu = () => {
    expandButton.style = defaultButton;
    headerNav.style.display = defaultNav;
    header.style = defaultHeader;
    headerUl.style = defaultUl;
    headerNav.style = defaultNav;
    headerSvg.style = defaultSvg;
    headerIcon.style = defaultIcon;
    searchIcon.style.display = "none"
    bookInputBox.style.display = 'none';
}

//*-------------------------- BOOK SEARCH BAR CAPTURE -------------------------*//
/* //TODO 
- Clear input value when user presses ENTER or click search button
- Send bookname to server and accept redirect response
*/
const searchButton = $.getElementsByClassName('search-icon')[0]
const searchClick = $.getElementsByClassName('search-click')[0]
const bookInputBox = $.getElementsByClassName('search-book-input')[0]
bookInputBox.style.transitionDelay = '5s'

var focused = false

bookInputBox.addEventListener('focus', () => {
    focused = true;
})
bookInputBox.addEventListener('focusout', () => {
    focused = false;
    if (bookInputBox.value === '') bookInputBox.style.display = 'none'
})
searchClick.addEventListener('click', () => {
    if (bookInputBox.style.display !== 'none' && bookInputBox.value !== '') {
        let search = bookInputBox.value
        window.location.href = `/books/search/${search}`
    }
})
bookInputBox.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && bookInputBox.value !== '') {
        searchClick.click()
    }
})
searchButton.addEventListener('mouseenter', () => {
    bookInputBox.style.display = 'inline-block';
})
searchButton.addEventListener('mouseleave', () => {
    if (bookInputBox.value === '' && !focused) bookInputBox.style.display = 'none'
})

//*-------------------------- 'KNOW MORE HIDDEN SECTION' -------------------------*//

const knowMoreContainer = $.getElementsByClassName('know-more-wrapper')[0]
const knowMoreCloseButton = $.getElementsByClassName('close')[0]

const knowMoreToggle = () => {
    if (knowMoreContainer.style.display === '' || knowMoreContainer.style.display === 'none') {
        knowMoreContainer.style.display = 'block'
    } else {
        knowMoreContainer.style.display = 'none'
    }
}

knowMoreCloseButton.addEventListener('click', () => {
    knowMoreToggle()
})

//*-------------------------- IMAGES SLIDER ARROWS -------------------------*//
const imagesLeftArrow = $.getElementsByClassName('left-arrow')[0]
const imagesRightArrow = $.getElementsByClassName('right-arrow')[0]

const slider = $.getElementsByClassName('images-slider')[0]

var currentImage = 0
var imagesNumber = 0

slider.style.left = '0px'

imagesRightArrow.addEventListener('click', () => {
    if (currentImage !== imagesNumber - 1) {
        if (window.innerWidth >= 979) {
            slider.style.left = parseInt(slider.style.left, 10) + parseInt('-979px', 10) + "px"
        } else {
            slider.style.left = parseInt(slider.style.left, 10) + parseInt(`-${window.innerWidth}px`, 10) + "px"
        }
        currentImage++
        updateImageInfo()
    }
})
imagesLeftArrow.addEventListener('click', () => {
    if (currentImage !== 0) {
        if (window.innerWidth >= 979) {
            slider.style.left = parseInt(slider.style.left, 10) + parseInt('979px', 10) + "px"
        } else {
            slider.style.left = parseInt(slider.style.left, 10) + parseInt(`${window.innerWidth}px`, 10) + "px"
        }
        currentImage--
        updateImageInfo()
    }
})

//*-------------------------- IMAGES SLIDER TEXT -------------------------*//
const paragraphWrapper = $.getElementsByClassName('slideshow-wrapper')[0].getElementsByClassName('paragraph-wrapper')[0]
const signature = $.getElementsByClassName('slideshow-wrapper')[0].getElementsByClassName('signature')[0]

var imagesData = null

const getImagesData = async () => {
    return fetch(`/main-page-slideshow-images-data`).then(res => res.json()).then(imagesData => {return imagesData})
}

// TO RUN WHEN DOC LOADS
$.addEventListener('DOMContentLoaded', async () => {
    imagesData = await getImagesData()
    buildImagesSlider()
    updateImageInfo()
})

const buildImagesSlider = () => {
    for (let imageData of imagesData) {
        let newImg = $.createElement('img')
        newImg.src = imageData.imageSrc
        $.getElementsByClassName('images-slider')[0].appendChild(newImg)
    }
    imagesNumber = $.getElementsByClassName('images-slider')[0].getElementsByTagName('img').length
}

const updateImageInfo = () => {
    if (currentImage < imagesData.length) {
        // Update Paragraphs
        let newP = $.createElement('p')
        paragraphWrapper.innerHTML = ''
        newP.innerText = imagesData[currentImage].text
        newP.style.textAlign = 'left'
        paragraphWrapper.appendChild(newP)
        // Update Signature
        signature.style.textAlign = imagesData[currentImage].alignSig
        signature.innerText = imagesData[currentImage].signature
    } else {
        paragraphWrapper.innerHTML = ''
        signature.innerText = ''
    }
}