/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

let isDrag = false,
  currentDrag,
  shiftX,
  shiftY;

document.addEventListener('mousemove', (e) => {});

document.addEventListener('dragstart', (e) => {
  currentDrag = e.target;
  e.dataTransfer.setData('text/html', '...');
  isDrag = true;
  console.log(isDrag);
  // Позиция захвата элемента
  shiftX = e.layerX;
  shiftY = e.layerY;
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (isDrag) {
    currentDrag.style.top = e.pageY - shiftY + 'px';
    currentDrag.style.left = e.pageX - shiftX + 'px';
  }
});

document.addEventListener('drop', (e) => {
  isDrag = false;
});

function randInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

export function createDiv() {
  const div = document.createElement('DIV');
  div.classList.add('draggable-div');
  div.draggable = true;

  // Рандом ширина, высота, радиус
  const width = randInterval(50, 200) + 'px',
    height = randInterval(50, 200) + 'px',
    radius = randInterval(0, 50) + '%';

  div.style.width = width;
  div.style.height = height;
  div.style.borderRadius = radius;

  // Рандом цвет
  div.style.background = randColor();

  // Рандом позиция на экране
  div.style.top = randInterval(1, 100) + '%';
  div.style.left = randInterval(1, 100) + '%';

  return div;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
  const div = createDiv();
  homeworkContainer.appendChild(div);
});
