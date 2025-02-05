async function fetchAlbums() {
    const response = await fetch('music_data.json')
    const data = await response.json()

    renderAlbums(data.data) 

    function renderAlbums(albums) {
        const albumListContainer = document.querySelector('.contents') 
        albumListContainer.innerHTML = '' 

        albums.forEach(album => {
            const albumItem = document.createElement('div')
            albumItem.classList.add('col-md-2', 'col-sm-2', 'col-xs-2', 'product-grid')

            albumItem.innerHTML = `
                <div class="product-items" id="${album.category}">
                    <div class="project-eff">
                        <img class="img-responsive" src="images/${album.albumJaketImage}" alt="${album.albumName}">
                    </div>
                    <div class="produ-cost">
                        <h5>${album.albumName}</h5>
                        <span><i class="fa fa-microphone"> 아티스트</i><p class="artist">${album.artist}</p></span>
                        <span><i class="fa fa-calendar"> 발매일</i><p class="release">${album.release}</p></span>
                        <span><i class="fa fa-money"> 가격</i><p class="price">${album.price}</p></span>
                        <span class="shopbtn">
                            <button class="btn btn-default btn-xs add-to-cart" data-album="${album.albumName}" data-price="${album.price}">
                                <i class="fa fa-shopping-cart"></i> 쇼핑카트 담기
                            </button>
                        </span>
                    </div>
                </div>
            `

            albumListContainer.appendChild(albumItem)
        })
    }
    
    let cart = [] 

    function addAlbum() {
        const addBtns = document.querySelectorAll('.shopbtn button') 

        addBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const albumItem = e.target.closest('.product-items')
                const albumName = albumItem.querySelector('.produ-cost h5').textContent
                const albumPriceText = albumItem.querySelector('.produ-cost .fa-money + p').textContent
                const albumImage = albumItem.querySelector('img').src
                const albumArtist = albumItem.querySelector('.artist').textContent
                const albumRelease = albumItem.querySelector('.release').textContent

                const albumPrice = parseInt(albumPriceText.replace("원", "").replace(",", "")) 

                
                const existingAlbumIndex = cart.findIndex(item => item.albumName === albumName)

                if (existingAlbumIndex !== -1) {
                    
                    cart[existingAlbumIndex].quantity++
                } else {
                    
                    cart.push({
                        albumName,
                        price: albumPrice,
                        quantity: 1,
                        albumImage,
                        albumArtist,
                        albumRelease
                    })
                }

                updateCartUI() 
                updateTotalPrice() 
                updateCartLength() 
            })
        })
    }

    function updateCartUI() {
        const shoppingCartTable = document.querySelector('tbody')
        shoppingCartTable.innerHTML = '' 

        cart.forEach(item => {
            const row = document.createElement('tr')
            const formattedPrice = new Intl.NumberFormat().format(item.price)

            row.innerHTML = `
                <td class="albuminfo">
                    <img src="${item.albumImage}" alt="${item.albumName}">
                    <div class="info">
                        <h4>${item.albumName}</h4>
                        <span>
                            <i class="fa fa-microphone"> 아티스트</i>
                            <p>${item.albumArtist}</p>
                        </span>
                        <span>
                            <i class="fa fa-calendar"> 발매일</i>
                            <p>${item.albumRelease}</p>
                        </span>
                    </div>
                </td>
                <td class="albumprice">
                    ￦ ${formattedPrice}
                </td>
                <td class="albumqty">
                    <input type="number" class="form-control" value="${item.quantity}" min="1">
                </td>
                <td class="pricesum">
                    ￦ ${new Intl.NumberFormat().format(item.price * item.quantity)}
                </td>
                <td>
                    <button class="btn btn-default" data-album="${item.albumName}">
                        <i class="fa fa-trash-o"></i> 삭제
                    </button>
                </td>
            `

            shoppingCartTable.appendChild(row)

            
            row.querySelector('.albumqty input').addEventListener('input', (e) => {
                item.quantity = parseInt(e.target.value)
                updateCartUI() 
                updateTotalPrice() 
            })

            
            row.querySelector('.btn').addEventListener('click', () => {
                const deleteCheck = confirm('정말로 삭제하시겠습니까?')
                if (deleteCheck) {
                    cart = cart.filter(cartItem => cartItem.albumName !== item.albumName)
                    updateCartUI() 
                    updateTotalPrice() 
                    updateCartLength() 
                }
            })
        })
    }

    function updateTotalPrice() {
        const totalPrice = cart.reduce((sum, album) => sum + (album.price * album.quantity), 0)
        const totalPriceElement = document.querySelector('.totalprice span')
        const totaltext = totalPriceElement.textContent = `￦ ${new Intl.NumberFormat().format(totalPrice)}`

        //미리보기 장바구니
        const Preview = document.querySelector('.panel-body .btn-primary')

        //앨범 총 개수 해결 못함
        Preview.innerHTML = `<i class="fa fa-shopping-cart"></i> 쇼핑카트 <strong>${totalPrice}</strong> 개 금액 ${totaltext}</a>`
    }

    function updateCartLength() {   
        const cartLength = cart.length
        const cartButton = document.querySelector('.panel-body button strong')
        cartButton.textContent = cartLength
    }
    
    function category() {
        const menuButtons = document.querySelectorAll('.nav > li > a')
        const changeTitle = document.querySelector('.col-md-12 h2')

        changeTitle.textContent = "All"

        menuButtons.forEach(button => {
            button.addEventListener('click', () => {
                menuButtons.forEach(item => item.classList.remove('active-menu'))
                button.classList.add('active-menu')

                //타이틀 이름 변경
                changeTitle.textContent = button.innerText

                chooseCategory()
            })
        })
    }
    
    function chooseCategory() {
        const content = document.querySelectorAll('.product-items')
        const activeMenu = document.querySelector('.nav .active-menu')
        const activeCategory = activeMenu ? activeMenu.textContent.trim() : 'ALL'

        content.forEach(contents => {
            const category = contents.id
            if (activeCategory === 'ALL' || activeCategory === category) {
                contents.parentNode.style.display = 'block'
            } else {
                contents.parentNode.style.display = 'none'
            }
        })
    }

    function searchAlbum() {
        const searchBtn = document.querySelector('.input-group-btn button')
        const albumItems = document.querySelectorAll('.product-grid')
        const productFrame = document.querySelector('.contents')

        searchBtn.addEventListener('click', () => {
            const inputValue = document.querySelector('.form-group .form-control').value

            if (inputValue.trim() === "") {
                alert("제목을 입력해주세요!")
                return
            }

            let foundAlbum = false
            albumItems.forEach(albumItem => {
                const albumNameElement = albumItem.querySelector('.produ-cost h5')
                const albumArtistElement = albumItem.querySelector('.fa-microphone + p')

                const albumName = albumItem.querySelector('.produ-cost h5').textContent
                const albumArtist = albumItem.querySelector('.fa-microphone + p').textContent

                const isNameMatch = albumName.toLowerCase().includes(inputValue.toLowerCase())
                const isArtistMatch = albumArtist.toLowerCase().includes(inputValue.toLowerCase())

                if (isNameMatch || isArtistMatch) {
                    albumItem.style.display = "block"
                    foundAlbum = true
                } else {
                    albumItem.style.display = "none"
                }

                albumNameElement.innerHTML = highlightText(albumName, inputValue)
                albumArtistElement.innerHTML = highlightText(albumArtist, inputValue)
            })

            if (!foundAlbum) {
                
                productFrame.innerHTML = "검색된 앨범이 없습니다."
            }
        })
    }

    function highlightText(text, input) {
        const regex = new RegExp(input, "gi")
        return text.replace(regex, (match) => `<mark class="highlight">${match}</mark>`)
    }

    function addCategory() {
        const nav = document.querySelector('.nav')
        const menu = document.querySelectorAll('.nav span')

        menu.forEach(menues => {
            if (menues.innerText === "ALL") {
                menues.parentNode.classList.add('all')
            } else if (menues.innerText === "발라드") {
                menues.parentNode.classList.add('발라드')
            }
        })

        const categories = ['재즈', '랩힙합', '댄스', '트로트', '포크어코스틱', '락메탈', 'R&B']

        categories.forEach(category => {
            nav.innerHTML += `
            <li>
            <a href="#" class="${category}"><i class="fa fa-youtube-play fa-2x"></i> <span>${category}</span></a>
            </li>
            `
        })
    }

    function payment() {
        const paymentBtn = document.querySelector('.modal-footer .btn-primary')
        const albumEmpty = document.querySelector('tbody')
        const modal = document.querySelector('.modal')

        paymentBtn.addEventListener('click', () => {
            if (albumEmpty.querySelector('tr') !== null) {
                alert("결제가 완료되었습니다.")
                location.reload(true);
            } else {
                alert("앨범을 추가해주세요.")
            }
        })
    }

    addCategory()
    addAlbum()
    category()
    searchAlbum()
    updateTotalPrice()
    payment()
}

fetchAlbums()
