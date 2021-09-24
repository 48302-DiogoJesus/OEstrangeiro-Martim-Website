const $ = document

// .split('~').join(' ')

const bookCards = $.getElementsByClassName('book-card')

const setupCardListeners = () => {
    for (let card of bookCards) {
        card.addEventListener('click', () =>
        {
            window.location.href = `/books/${card.getElementsByTagName('h1')[0].innerText.split(' ').join('~')}` 
        })
    }
}

setupCardListeners()