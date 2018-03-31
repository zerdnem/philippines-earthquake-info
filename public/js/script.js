var mymap = L.map("mapid", { attributionControl: false }).setView(
  [12.8797, 121.774],
  6
);

localStorage.removeItem("date");

//dark map(preferred)
L.tileLayer(
  "https://api.tiles.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  { attribution: "", maxZoom: 18 }
).addTo(mymap);

var cssIcon = L.divIcon({
  className: "css-icon",
  html: '<div class="gps_ring"></div>',
  iconSize: [22, 22]
});

var socket = io();

L.easyButton("fa-star", function() {
  $(".fa-star").pickadate({
    today: "",
    clear: "",
    close: "",
    onSet: context => {
      date = context.select;
      if (date) {
        socket.emit("pick date", { date: date });
      }
    }
  });
}).addTo(mymap);

socket.on("data from sqlite", function(dbdata) {
  deleteFromGroupByID();
  dbdata.data.map(data => {
    var coord = [data.latitude, data.longitude];
    console.log(`${data.location} [${data.magnitude}]`);
    L.marker(coord, { icon: cssIcon }).addTo(mymap);
    L.marker(coord)
      .bindPopup(
        "<b>Date: </b>" +
          data.date +
          "<br>" +
          "<b>Latitude: </b>" +
          data.latitude +
          "<br>" +
          "<b>Longitude: </b>" +
          data.longitude +
          "<br>" +
          "<b>Depth: </b>" +
          data.depth +
          "<br>" +
          "<b>Magnitude: </b>" +
          data.magnitude +
          "<br>" +
          "<b>Location: </b>" +
          data.location
      )
      .openPopup()
      .addTo(mymap);
  });
});

L.control
  .locate({
    returnToPrevBounds: true,
    strings: {
      title: "Show me where I am, yo!"
    },
    circlePadding: [50, 50]
  })
  .addTo(mymap);

socket.on("newdata", function(newdata) {
  console.log(newdata);

  if (localStorage.getItem("date") == null) {
    localStorage.setItem("date", "test");
  }

  localStorage.setItem("data", JSON.stringify(newdata));

  var storageData = localStorage.getItem("data");
  var data = JSON.parse(storageData);

  var dataDate = localStorage.getItem("date");

  console.log(data.date == dataDate);

  if (data.date !== dataDate) {
    var coord = [data.latitude, data.longitude];
    L.marker(coord, { icon: cssIcon }).addTo(mymap);
    L.marker(coord)
      .bindPopup(
        "<b>Date: </b>" +
          data.date +
          "<br>" +
          "<b>Latitude: </b>" +
          data.latitude +
          "<br>" +
          "<b>Longitude: </b>" +
          data.longitude +
          "<br>" +
          "<b>Depth: </b>" +
          data.depth +
          "<br>" +
          "<b>Magnitude: </b>" +
          data.magnitude +
          "<br>" +
          "<b>Location: </b>" +
          data.location
      )
      .openPopup()
      .addTo(mymap);
    localStorage.setItem("date", data.date);
  }
});

var tempID = 1;
mymap.eachLayer(function(layer) {
  layer.layerID = tempID;
  tempID += 1;
  layer.bindPopup("Layer ID: " + layer.layerID);
});

deleteFromGroupByID = function(group, ID) {
  mymap.eachLayer(function(layer) {
    if (layer.layerID === ID) {
      mymap.removeLayer(layer);
    }
  });
};
