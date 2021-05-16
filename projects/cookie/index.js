/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответствует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

import './cookie.html';

/*
 app - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#app');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');
// Cookie которые есть
let cookies = parseCookie();

function parseCookie() {
  if (!document.cookie.length) return false;

  return document.cookie.split('; ').reduce((prev, current) => {
    const [name, value] = current.split('=');
    prev[name] = value;
    return prev;
  }, {});
}

function setCookie(name, value, options = {}) {
  options = {
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (const optionKey in options) {
    updatedCookie += '; ' + optionKey;
    const optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
  cookies = parseCookie();
}

function deleteCookie(name) {
  setCookie(name, null, { expires: 'Thu, 01 Jan 1970 00:00:01 GMT' });
}

function createElement(name, value) {
  const root = document.createElement('TR');
  root.classList.add('cookie-row');
  root.dataset.name = name;

  const nameElement = document.createElement('TD');
  nameElement.textContent = name;

  const valueElement = document.createElement('TD');
  valueElement.textContent = value;

  const deleteElement = document.createElement('TD');
  const deleteLink = document.createElement('BUTTON');
  deleteLink.classList.add('cookie-delete');
  deleteLink.textContent = 'Удалить';

  deleteElement.appendChild(deleteLink);

  root.appendChild(nameElement);
  root.appendChild(valueElement);
  root.appendChild(deleteElement);

  return root;
}

function drawTable() {
  listTable.textContent = '';
  if (cookies) {
    const fragment = document.createDocumentFragment();

    for (const item in cookies) {
      if (Object.prototype.hasOwnProperty.call(cookies, item)) {
        const rowElement = createElement(item, cookies[item]);
        fragment.appendChild(rowElement);
      }
    }

    listTable.appendChild(fragment);
  }
}

function trigger(element, evt) {
  const event = new CustomEvent(evt);
  element.dispatchEvent(event);
}

filterNameInput.addEventListener('input', function (e) {
  drawTable();

  const filter = e.target.value;
  if (cookies && filter.length) {
    for (const item in cookies) {
      const cookie = [item, cookies[item]];

      const showItem = cookie.some((elem) => {
        return elem.includes(filter);
      });

      if (!showItem) homeworkContainer.querySelector(`[data-name="${item}"]`).remove();
    }
  }
});

addButton.addEventListener('click', () => {
  const name = addNameInput.value;
  const value = addValueInput.value;

  if (name.length && value.length) {
    setCookie(name, value);
    trigger(filterNameInput, 'input');
  }
});

listTable.addEventListener('click', (e) => {
  e.preventDefault();

  const target = e.target;
  if (target.classList.contains('cookie-delete')) {
    let parent = target.parentElement;

    // Идем вверх по дереву до родителя TR
    do {
      if (parent.tagName === 'TR') break;
    } while ((parent = parent.parentElement));

    const cookieName = parent.firstElementChild.textContent;
    deleteCookie(cookieName);
    trigger(filterNameInput, 'input');
  }
});

drawTable();
