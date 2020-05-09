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
  inputSearch = document.querySelector('.input-search'),
  modalBody = document.querySelector('.modal-body'),
  modalPrice = document.querySelector('.modal-pricetag'),
  buttonClearCart = document.querySelector('.clear-cart');

const cart = [];

let login = localStorage.getItem('login');

const getData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error on ${url}, error status ${response.status}`);
  }
  return await response.json();
};

const toggleModal = () => modal.classList.toggle("is-open");
const toggleModalAuth = () => modalAuth.classList.toggle('is-open');

const validate = login => {
  const regExp = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return regExp.test(login);
};

const authorized = () => {
  const logOut = () => {
    login = null;
    cart.length = 0;
    localStorage.removeItem('login');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  };

  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart();
};

const notAuthorized = () => {
  const logIn = event => {
    event.preventDefault();
    if (validate(loginInput.value)) {
      loginInput.style.borderBottomColor = '';
      login = loginInput.value;
      localStorage.setItem('login', login);
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
  };

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

const checkAuth = () => login ? authorized() : notAuthorized();

const returnMain = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};

const openGoods = event => {
  if (!login) {
    toggleModalAuth();
    return;
  }

  const restaurant = event.target.closest('.card-restaurant');
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

    getData(`./db/${restaurant.products}`)
      .then(data => data.forEach(createCardGood));
  }
};

const createCardRestaurant = ({ image, kitchen, name, price, stars, products,
  time_of_delivery: timeOfDelivery }) => {

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
};

const createCardGood = ({ description, image, name, price, id }) => {
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
				<button class="button button-primary button-add-cart" id="${id}">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price card-price-bold">${price} ₽</strong>
			</div>
		</div>
  `);
  cardsMenu.insertAdjacentElement('beforeend', card);
};

const loadCart = () => {
  const localStorageCart = localStorage.getItem(login); 
  if (localStorageCart){
    cart.push(...JSON.parse(localStorageCart));
  }
};

const saveCart = () => localStorage.setItem(login, JSON.stringify(cart));

const searchGoods = async event => {
  if (event.keyCode !== 13) {
    return;
  }

  const value = event.target.value.toLowerCase().trim();
  event.target.value = '';

  if (!value) {
    event.target.style.backgroundColor = '#FA8155';
    setTimeout(() => event.target.style.backgroundColor = '', 2000);
    return;
  }

  const data = await getData('./db/partners.json');
  const products = data.map(item => item.products);
  const productsRequests = products.map(product => getData(`./db/${product}`));
  const productsArrays = await Promise.all(productsRequests);
  const goods = productsArrays.reduce((allProducts, productsArr) => {
    allProducts.push(...productsArr);
    return allProducts;
  }, []);
 
  cardsMenu.textContent = '';
  containerPromo.classList.add('hide');
  restaurants.classList.add('hide');
  menu.classList.remove('hide');

  restaurantTitle.textContent = 'Результат поиска';
  rating.textContent = '';
  minPrice.textContent = '';
  category.textContent = '';

  const filteredGoods = goods.filter((good) =>
    good.name.toLowerCase().includes(value));
  filteredGoods.forEach(createCardGood);
};

const addToCart = event => {
  const buttonAddToCart = event.target.closest('.button-add-cart');
  if (buttonAddToCart) {
    const card = event.target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;

    const food = cart.find((good) => good.id === id);
    food ? food.count += 1 : cart.push({ id, title, cost, count: 1 });
  }
  saveCart();
};

const renderCart = () => {
  modalBody.textContent = '';
  const cartItems = cart.reduce((htmlItems, { id, title, cost, count }) => {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `; 
    return htmlItems.concat(itemCart);
  }, '');
  modalBody.insertAdjacentHTML('afterbegin', cartItems);

  const totalPrice = cart.reduce(
    (result, item) => result +
      (parseFloat(item.cost) * item.count), 0);

  modalPrice.textContent = totalPrice + ' ₽';
};

const changeCount = event => {
  if (event.target.classList.contains('counter-button')) {
    const food = cart.find((item) => item.id === event.target.dataset.id);
    if (event.target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    };
    if (event.target.classList.contains('counter-plus')) {
      food.count++;
    }

    renderCart();
  }
  saveCart();
};

const clearCart = () => {
  cart.length = 0;
  renderCart();
};

const cartButtonOnClick = () => {
  renderCart();
  toggleModal();
};

function init() {
  getData('./db/partners.json').then(data => data.forEach(createCardRestaurant));

  buttonClearCart.addEventListener('click', clearCart);
  cartButton.addEventListener('click', cartButtonOnClick);
  modalBody.addEventListener('click', changeCount);
  close.addEventListener("click", toggleModal);
  cardsRestaurants.addEventListener('click', openGoods);
  logo.addEventListener('click', returnMain);
  inputSearch.addEventListener('keydown', searchGoods);
  cardsMenu.addEventListener('click', addToCart);

  checkAuth();

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: true
  });
}

init();





