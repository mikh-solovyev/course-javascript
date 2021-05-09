/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns.html

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */

import './towns.html';

const homeworkContainer = document.querySelector('#app');
let townsList = {};
/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
function loadTowns() {
  // При загрузке убираем блоки, которые не нужны и показываем надпись загрузка
  showBlock(loadingBlock);
  hideBlock(loadingFailedBlock, filterBlock);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json'
    );
    xhr.send();

    xhr.addEventListener('load', (e) => {
      if (xhr.status > 400) {
        reject();
      }

      const towns = JSON.parse(xhr.response);

      towns.sort((a, b) => {
        return a.name < b.name ? -1 : a > b ? 1 : 0;
      });

      resolve(towns);
    });

    xhr.addEventListener('error', (e) => {
      reject();
    });
  });
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
  return full.toLowerCase().includes(chunk.toLowerCase());
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с надписью "Не удалось загрузить города" и кнопкой "Повторить" */
const loadingFailedBlock = homeworkContainer.querySelector('#loading-failed');
/* Кнопка "Повторить" */
const retryButton = homeworkContainer.querySelector('#retry-button');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');

function init() {
  loadTowns()
    .then((towns) => {
      townsList = towns;
      // В случае удачной загрузки показываем нужные блоки и скрываем ненужные
      showBlock(filterBlock);
      hideBlock(loadingFailedBlock, loadingBlock);
    })
    .catch(() => {
      // В случае ошибки показываем блок с кнопкой повторить загрузку
      showBlock(loadingFailedBlock);
      hideBlock(loadingBlock);
    });
}

retryButton.addEventListener('click', () => {
  init();
});

filterInput.addEventListener('input', function () {
  if (filterInput.value.length) {
    filterResult.textContent = '';

    const filterList = townsList.filter((item) => {
      return isMatching(item.name, filterInput.value);
    });

    if (filterList) {
      for (const item of filterList) {
        const elem = document.createElement('div');
        elem.textContent = item.name;
        filterResult.appendChild(elem);
      }
    }
  } else {
    filterResult.textContent = '';
  }
});

function hideBlock(...arrElements) {
  arrElements.forEach((element) => {
    element.style.display = 'none';
  });
}

function showBlock(...arrElements) {
  arrElements.forEach((element) => {
    element.style.display = 'block';
  });
}

init();

export { loadTowns, isMatching };
