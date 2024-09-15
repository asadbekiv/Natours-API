ymaps.ready(init);

function init() {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );
  let avgLat = 0,
    avgLong = 0;
  locations.forEach((key) => {
    avgLat += key.coordinates[1];
    avgLong += key.coordinates[0];
  });

  

  avgLat /= locations.length;
  avgLong /= locations.length;
  var myMap = new ymaps.Map('map', {
    center: [avgLat, avgLong], // Example coordinates for New York City
    zoom: 8,
    type: 'yandex#hybrid',
  });
  

  locations.forEach((key) => {
    var reversedCoordinates = [key.coordinates[1], key.coordinates[0]];

    var placemark = new ymaps.Placemark(
      reversedCoordinates,
      {
        balloonContent: key.description,
      },
      {
        preset: 'el', // Use a valid preset for the placemarks
        iconColor: '#FF0000',
      },
    );
    myMap.geoObjects.add(placemark);
  });
  const polylineCoordinates = locations.map((location) => [
    location.coordinates[1], // Latitude
    location.coordinates[0], // Longitude
  ]);

  var myPolyline = new ymaps.Polyline(
    polylineCoordinates,
    {},
    {
      strokeColor: '#00FF00',
      strokeWidth: 2,
    },
  );

  myMap.geoObjects.add(myPolyline);
}
