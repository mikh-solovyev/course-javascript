let myMap, myClusterer;
const placeMarks = JSON.parse(localStorage.placemarks || '{}');

const init = () => {
    // Добавляем поиск по карте
    const searchInput = new ymaps.control.SearchControl({
        options: {
            size: 'large',
            provider: 'yandex#search',
        },
    });

    // Создание карты
    myMap = new ymaps.Map('map', {
            center: [55.643344, 37.744528],
            zoom: 15,
            controls: ['zoomControl', searchInput],
        },
        {
            geoObjectClusterDisableClickZoom: true,
        }
    );

    // Обработка клика по карте
    myMap.events.add('click', (e) => {
        const coords = e.get('coords');
        toggleBalloon(coords);
    });

    // Клик по всем объектам на карте
    myMap.geoObjects.events.add('click', function (e) {
        e.preventDefault();
        const object = e.get('target');
        const name = object.options._name;

        // Если клик произошел по кластеру, то проверяем разные ли адреса у объектов
        if (name === 'cluster') {
            const clusterObj = object.getGeoObjects();
            checkBalloonType(clusterObj);
        }

        const arrCoords = object.geometry._coordinates.map((item) => {
            return parseFloat(item).toPrecision(5);
        });
        const arrData = placeMarks[arrCoords.join('-')];
        toggleBalloon(arrCoords, arrData);
    });

    drawPlacemark();
};

/**
 * Проверка формы на валидность
 * @param form
 * @returns {boolean}
 */
function validateForm(form) {
    let isValid = true;
    const fields = form.elements;
    [...fields].forEach((item) => {
        item.classList.remove('balloon__field_error');

        if (!item.value.length) {
            item.classList.add('balloon__field_error');
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Отрисовка объектов на карте
 */
function drawPlacemark() {
    // Очищаем все метки и рисуем с учетом кластеризации
    myMap.geoObjects.removeAll();

    const coords = getCoords();
    const placemarks = [];

    const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="carousel">
            <a href="#" class="carousel__header" data-latitude="{{properties.latitude}}" data-longitude="{{properties.longitude}}">{{ properties.address }}</a>
            <div class="carousel__content">
                <div class="carousel__row">
                    <b class="reviews__name">{{ properties.name }}</b>
                    <span>{{ properties.place }}</span>
                    <span>{{ properties.date }}</span>
                </div>
                <div class="carousel__row">
                    <div class="reviews__text">{{ properties.comment }}</div>
                </div>
            </div>
        </div>`
    );

    myClusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customItemContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 400,
        clusterBalloonContentLayoutHeight: 130,
        clusterBalloonPagerSize: 5,
    });

    for (let i = 0; i < coords.length; i++) {
        for (const review of placeMarks[coords[i].join('-')]) {
            placemarks.push(
                new ymaps.Placemark(coords[i], {
                    latitude: coords[i][0],
                    longitude: coords[i][1],
                    name: review.name,
                    place: review.place,
                    date: review.date,
                    comment: review.comment,
                    address: review.address,
                })
            );
        }
    }

    myClusterer.add(placemarks);
    myMap.geoObjects.add(myClusterer);
    setTitle();
}

/**
 * Получение координат записаных в localstorage
 * @returns {*[]}
 */
function getCoords() {
    const coords = [];
    // Проходим по уникальным координатам
    for (const item in placeMarks) {
        coords.push(item.split('-'));
    }
    return coords;
}

/**
 * Открытие и закрытие балуна
 * @param coords - Координаты, где открываем
 * @param reviews - Отзывы у данной координаты
 */
function toggleBalloon(coords, reviews = []) {
    const balloonContent = document.querySelector('#balloon');
    if (!myMap.balloon.isOpen()) {
        let contentBody = balloonContent.innerHTML;
        contentBody = contentBody.replace(
            '{{latitude}}',
            parseFloat(coords[0]).toPrecision(5)
        );
        contentBody = contentBody.replace(
            '{{longitude}}',
            parseFloat(coords[1]).toPrecision(5)
        );

        let reviewsHTML = '';
        let windowTitle = '';
        // Отрисовываем отзывы
        reviews.forEach((review) => {
            windowTitle = review.address;
            reviewsHTML += `<li class="reviews__item">
                <div class="reviews__row">
                    <b class="reviews__name">${review.name}</b>
                    <span>${review.place}</span>
                    <span>${review.date}</span>
                </div>
                <div class="reviews__row">
                    <div class="reviews__text">${review.comment}</div>
                </div>
            </li>`;
        });

        contentBody = contentBody.replace('{{reviews}}', reviewsHTML);

        myMap.balloon.open(
            coords,
            {
                contentHeader: 'Отзыв',
                contentBody: contentBody,
            },
            {
                minWidth: 320,
                maxHeight: 500,
            }
        );

        setTitle(windowTitle);
    } else {
        closeBalloon();
    }
}

/**
 * Проверка на тип балуна, либо это наш либо карусель
 * @param obj
 */
function checkBalloonType(obj) {
    const uniqCoords = new Set();
    obj.forEach((item) => {
        uniqCoords.add(item.geometry._coordinates.join('-'));
    });

    // в кластеризаторе есть минимум 2 разных адреса
    if (uniqCoords.size > 1) {
        myClusterer.options.set({
            hasBalloon: true,
        });
    } else {
        myClusterer.options.set({
            hasBalloon: false,
        });
    }
}

/**
 * Закрытие балуна
 */
function closeBalloon() {
    myMap.balloon.close();
}

/**
 * Получение адреса по координатам, запрос на геокодер
 * @param latitude
 * @param longitude
 * @returns {Promise<string|boolean>}
 */
async function getAddress({latitude, longitude}) {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=119dcc41-7e4f-438d-9ec1-39216a407758&format=json&geocode=${longitude},${latitude}`;
    const response = await fetch(url);
    const result = await response.json();

    // Может есть какой то способ получить адрес более правильно )
    return (
        result.response.GeoObjectCollection.featureMember[0].GeoObject.metaDataProperty
            .GeocoderMetaData.Address.formatted || false
    );
}

/**
 * Смена заголовка окна браузера
 * @param title
 */
function setTitle(title) {
    document.title = title || 'Геоотзыв';
}

window.addEventListener('load', () => {
    const balloonContent = document.querySelector('#map');

    // Обработка кликов через делегирование
    balloonContent.addEventListener('click', (e) => {
        const target = e.target;

        // Обработка клика по кнопке добавить отзыв
        if (target.classList.contains('balloon__btn')) {
            e.preventDefault();
            const form = target.parentElement,
                isValid = validateForm(form);

            if (isValid) {
                const fields = form.elements;
                const date = new Date();
                const data = {
                    name: fields.name.value,
                    place: fields.place.value,
                    date: `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`,
                    comment: fields.comment.value,
                };

                const coords = {
                    latitude: fields.latitude.value,
                    longitude: fields.longitude.value,
                };

                // Формируем обхъект для localStorage
                const key = `${coords.latitude}-${coords.longitude}`;

                // Делаем запрос на геокодер
                const promise = getAddress(coords);

                promise.then((result) => {
                    data.address = result || data.place;

                    if (Object.prototype.hasOwnProperty.call(placeMarks, key)) {
                        placeMarks[key].push(data);
                    } else {
                        placeMarks[key] = [data];
                    }

                    // Записываем в сторайд
                    localStorage.placemarks = JSON.stringify(placeMarks);

                    drawPlacemark();

                    // Закрываем балун
                    myMap.balloon.close();
                });
            }
        }

        // Клик по адресу в каруселе отзывов
        if (target.classList.contains('carousel__header')) {
            const coords = [target.dataset.latitude, target.dataset.longitude];
            closeBalloon();
            toggleBalloon(coords, placeMarks[coords.join('-')]);
        }
    });

    ymaps.ready(init);
});
