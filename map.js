window.addEventListener("load", ready);
function ready() {
  let btnWrapper = document.querySelector(".btn-wrapper");
  let countries = btnWrapper.querySelectorAll(".btn-wrapper [data-country]");
  let cityWrapper = document.querySelector(".city-wrapper");
  let offices = document.querySelectorAll(".city-list .office");
  countries[0].classList.add("active");
  let defaultCountry = countries[0].dataset.country;
  document.querySelector(`.city-list.${defaultCountry}`).classList.add("active");
  for (let c of countries) {
    c.onclick = showAddresses;
  }
  function showAddresses() {
    btnWrapper.querySelector(".active").classList.remove("active");
    this.classList.add("active");
    let country = this.dataset.country;
    cityWrapper.querySelector(".active").classList.remove("active");
    cityWrapper.querySelector(`.${country}`).classList.add("active");
    console.log(this.dataset.country)
  }

  //Яндекс карта
  /*
  myMap.geoObjects.add(myGeoObject) — добавление объекта на карту,
  myMap.geoObjects.remove(myGeoObject) — удаление объекта с карты.
  */
  ymaps.ready(init);
  function init() {
    let circleLayout = ymaps.templateLayoutFactory.createClass('<div class="circle-placemark"></div>');
    var commonContent = ymaps.templateLayoutFactory.createClass('<div class="circle-placemark">$[properties.iconContent]</div>');
    // Создание карты.
    var myMap = new ymaps.Map(document.querySelector("#map-id"), {
      // Координаты центра карты.
      // Порядок по умолчанию: «широта, долгота».
      center: [55.76, 37.64],
      // Уровень масштабирования. Допустимые значения:
      // от 0 (весь мир) до 19.
      zoom: 4,
      mapAutoFocus: false,
      clusterize: true
    }),
      clusterer = new ymaps.Clusterer({
        //preset: 'islands#invertedNightClusterIcons',
        /**
         * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
         */
        groupByCoordinates: false,
        /**
         * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
         */
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterIconLayout: commonContent,
      })

    let myCollection = new ymaps.GeoObjectCollection();

    //массив точек на карте
    fetch('/offices.json')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        makePoints(data[defaultCountry]);
        //переключение стран
        for (let c of countries) {
          c.onclick = showAddresses;
        }
        for (let f of offices) {
          f.onclick = openBalloon;
        }

        function showAddresses() {
          btnWrapper.querySelector(".active").classList.remove("active");
          this.classList.add("active");
          let country = this.dataset.country;
          cityWrapper.querySelector(".active").classList.remove("active");
          cityWrapper.querySelector(`.${country}`).classList.add("active");
          //удаление всех точек с карты
          myMap.geoObjects.removeAll();
          clusterer.removeAll();
          //отображение новых точек
          makePoints(data[country]);
        }
      });

    function openBalloon() {
      let city = this.closest("details").querySelector("summary").textContent;
      let addres = this.querySelector(".addres").textContent;
      let baloonContent = this.innerHTML;
      ymaps.geocode(`${city}, ${addres}`).then(
        function (res) {
          let coords = getCitycenter(res.geoObjects.get(0).properties.getAll().boundedBy);
          myMap.balloon.open(coords, { content: baloonContent }, { closeButton: true });
          myMap.container.fitToViewport()
          myMap.setZoom(15);
          myMap.setCenter(coords);
        },
        function (err) {
          // Обработка ошибки.
          console.log(err)
        }
      );
    }

    let points = [];
    function makePoints(arr) {
      for (let a = 1; a < arr.length; a++) {
        for (let f of arr[a].offices) {
          ymaps.geocode(`${arr[a].city}, ${f.addres}`).then(
            function (res) {
              let coords = getCitycenter(res.geoObjects.get(0).properties.getAll().boundedBy);
              let ballooncontent = [
                f.addres,
                f.name,
                f.email,
                f.phone
              ];
              addPlacemark(coords, ballooncontent);
            },
            function (err) {
              // Обработка ошибки.
              console.log(err)
            }
          );
        }
      }
    }

    function getCitycenter(arr) {
      return [(arr[0][0] + arr[1][0]) / 2, (arr[0][1] + arr[1][1]) / 2]
    }

    //добавление точек на карту
    function addPlacemark(coords, content) {
      function getP(arr) {
        let result = "";
        for (let a of arr) {
          result += `<p>${a}</p>`;
        }
        return result;
      }
      let placemark = new ymaps.Placemark(
        coords,
        {
          type: "Point",
          balloonContentBody: `<p class="title">${content[0]}</p>
        <p>${content[1]}</p>
        <div class="phone-wrapper">${getP(content[3])}</div>
        <div class="email-wrapper">${getP(content[2])}</div>`,
        },
        {
          iconLayout: circleLayout,//форма кликабельной области placemark
          iconShape: {
            type: 'Circle',
            coordinates: [0, 0],//центр круга
            radius: 25//радиус
          },
          hideIconOnBalloonOpen: false
        }
      );
      placemark.events.add('click', function (e) {
        myMap.setCenter(placemark.geometry.getCoordinates());
      });
      myCollection.add(placemark);
      myMap.geoObjects.add(placemark);
      points.push(placemark);
      //console.log(coords)
      clusterer.add(placemark);
      myMap.geoObjects.add(clusterer);
      myMap.setBounds(clusterer.getBounds(), {
        checkZoomRange: true
      });
    } 
  }
}
