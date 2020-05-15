'use strict';

const cartButton = document.querySelector("#cart-button"),
  modal = document.querySelector(".modal"),
  close = document.querySelector(".close"),
  buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  logInForm = document.querySelector('#logInForm'),
  loginInput = document.querySelector('#login'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  cardsRestaurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  logo = document.querySelector('.logo'),
  cardsMenu = document.querySelector('.cards-menu'),
  restaurantTitle = document.querySelector('.restaurant-title'),
  rating = document.querySelector('.rating'),
  minPrice = document.querySelector('.price'),
  category = document.querySelector('.category'),
  inputSearch = document.querySelector('.input-search');

let login = localStorage.getItem('logMemo');

const getData = async function (url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error on ${url}, error status ${response.status}`);
  }
  return await response.json();
};

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  modalAuth.classList.toggle('is-open');
}

function validate(login) {
  const regExp = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return regExp.test(login);
}

function authorized() {

  function logOut() {
    login = null;
    localStorage.removeItem('logMemo');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'block';

  buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {

  function logIn(event) {
    event.preventDefault();
    if (validate(loginInput.value)) {
      loginInput.style.borderBottomColor = '';
      login = loginInput.value;
      localStorage.setItem('logMemo', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderBottomColor = '#FA8155';
      loginInput.value = '';
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

function returnMain() {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

function openGoods(event) {
  const target = event.target;
  if (login) {
    const restaurant = target.closest('.card-restaurant');
    if (restaurant) {
      const [name, price, stars, kitchen] = restaurant.info;

      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen;

      getData(`./db/${restaurant.products}`).then(function (data) {
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
}

function createCardRestaurant({ image, kitchen, name, price, stars, products,
  time_of_delivery: timeOfDelivery }) {

  const card = document.createElement('a');
  card.className = 'card card-restaurant';
  card.products = products;
  card.info = [name, price, stars, kitchen];

  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
      <div class="card-info">
        <div class="rating">
        ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  `);
  cardsRestaurants.insertAdjacentElement('beforeend', card);
}

function createCardGood({ description, image, name, price }) {
  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML('beforeend', `
		<img src="${image}" alt="image" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title card-title-reg">${name}</h3>
			</div>
			<div class="card-info">
				<div class="ingredients">${description}
				</div>
			</div>
			<div class="card-buttons">
				<button class="button button-primary button-add-cart">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price-bold">${price} ₽</strong>
			</div>
		</div>
  `);
  cardsMenu.insertAdjacentElement('beforeend', card);
}

function searchGoods(event) {
  if (event.keyCode === 13) {
    const value = event.target.value.toLowerCase().trim();
    const goods = [];
    event.target.value = '';

    if (!value) {
      event.target.style.backgroundColor = '#FA8155';
      setTimeout(() => event.target.style.backgroundColor = '', 2000);
      return;
    }
    
    getData('./db/partners.json')
      .then(function (data) {
        const products = data.map(item => item.products);

        products.forEach(product => {
          getData(`./db/${product}`)
            .then(data => {
              goods.push(...data);
              const filterGoods = goods.filter((good) => 
                good.name.toLowerCase().includes(value));

              cardsMenu.textContent = '';
              containerPromo.classList.add('hide');
              restaurants.classList.add('hide');
              menu.classList.remove('hide');

              restaurantTitle.textContent = 'Результат поиска';
              rating.textContent = '';
              minPrice.textContent = '';
              category.textContent = '';

              return filterGoods;
            })
            .then((data) => {
              data.forEach(createCardGood);
            });
        });
      });
  }
}

function init() {
  getData('./db/partners.json').then(function (data) {
    data.forEach(createCardRestaurant);
  });

  cartButton.addEventListener("click", toggleModal);

  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener('click', openGoods);

  logo.addEventListener('click', returnMain);

  inputSearch.addEventListener('keydown', searchGoods);

  checkAuth();

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: true
  });
}

init();





