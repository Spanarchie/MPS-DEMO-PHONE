
var curloc = new google.maps.LatLng(51.502816, -0.126730);

var patrol = [new google.maps.LatLng(51.502081,-0.140119), new google.maps.LatLng(51.507183,-0.127866), new google.maps.LatLng(51.500949,-0.126171)];
var markers = [];
var iterator = 0;
var map;

function drop() {
    loc = curloc;
    addMarker(loc);
  }

function step() {
    loc = patrol[iterator];

    addMarker(loc);
    iterator=iterator+1;
  }


function addMarker(loc) {
  var image = 'images/police_icon_20.png';
  markers.push(new google.maps.Marker({
    position: loc,
    map: map,
    title: "PC12345",
    draggable: false,
    animation: google.maps.Animation.DROP,
    icon: image
  }));
}


function getDirections(){
var directionDisplay;
  var directionsService = new google.maps.DirectionsService();
  function initialize() {
    var latlng = new google.maps.LatLng(51.502081,-0.140119);
    directionsDisplay = new google.maps.DirectionsRenderer();
    var myOptions = {
      zoom: 14,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));
    var marker = new google.maps.Marker({
      position: latlng, 
      map: map, 
      title:"My location"
    }); 
  }
  function calcRoute() {
    var start = document.getElementById("routeStart").value;
    var end = "51.507183,-0.127866";
    var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }

};







