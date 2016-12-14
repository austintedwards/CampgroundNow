$(function(){
  //GPS
  $("#GPS").click(function(){
    event.preventDefault();
    GPS();
  });
  function GPS(){
     var options = {
       enableHighAccuracy: true,
       timeout: 5000,
       maximumAge: 0
     };
     function success(pos) {
       var crd = pos.coords;
       var location = {lat:crd.latitude, long:crd.longitude};
       currentCity(location);
     }
     function error(err) {
       console.warn('ERROR(' + err.code + '): ' + err.message);
     }
     navigator.geolocation.getCurrentPosition(success, error, options);
   }

//inputs location grom GPS
   function currentCity(location){
     $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+location.lat+","+location.long+"&key=AIzaSyAFSPs5znb5ggZ7ZyajBCJMdBiKEXV6UG0",function(city){
       var address = city.results[0].formatted_address;
       $("#location").val(address);
     });
   }

  //using search to find location of input
     $("#search").click(function(){
       event.preventDefault();
       $(".campList").html("");
       var town = $("#location").val();
       locationInput(town);
     });

     function locationInput(place){
       $.get("https://maps.googleapis.com/maps/api/geocode/json?address="+place+"&key=AIzaSyAFSPs5znb5ggZ7ZyajBCJMdBiKEXV6UG0",function(town){
         var spot = town.results[0].geometry.location;
         var findState = town.results[0].address_components;
         if (findState.length > 7){
           var state = findState[5].short_name;
         }else{
           state = findState[2].short_name;
         }
         getCampsites(state, spot);
       });
     }

//API Get
  function getCampsites(state, spot){
    $.get("http://api.amp.active.com/camping/campgrounds?pstate="+state+"&api_key=zbbcdmvv4g9dj5xxnhu4r4hh", function(xml){
      console.log(xml);
      var master_obj = xmlToJson(xml);
      getCamp(master_obj, spot);
      });
  }

//xml to JSON
  function xmlToJson(xml) {
      	// Create the return object
      	var obj = {};

      	if (xml.nodeType == 1) { // element
      		// do attributes
      		if (xml.attributes.length > 0) {
      		obj["@attributes"] = {};
      			for (var j = 0; j < xml.attributes.length; j++) {
      				var attribute = xml.attributes.item(j);
      				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      			}
      		}
      	} else if (xml.nodeType == 3) { // text
      		obj = xml.nodeValue;
      	}

      	// do children
      	// If just one text node inside
      	if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
      		obj = xml.childNodes[0].nodeValue;
      	}
      	else if (xml.hasChildNodes()) {
      		for(var i = 0; i < xml.childNodes.length; i++) {
      			var item = xml.childNodes.item(i);
      			var nodeName = item.nodeName;
      			if (typeof(obj[nodeName]) == "undefined") {
      				obj[nodeName] = xmlToJson(item);
      			} else {
      				if (typeof(obj[nodeName].push) == "undefined") {
      					var old = obj[nodeName];
      					obj[nodeName] = [];
      					obj[nodeName].push(old);
      				}
      				obj[nodeName].push(xmlToJson(item));
      			}
      		}
      	}
        return obj;
    }

//getting a set object variable
  function getCamp(results, spot){
    var camps = results.resultset.result;
    campLocations(camps, spot);
   }

//cleaning up the objects
   function campLocations(camps, spot){
      var campSpots = [];
     for (var i = 0; i < camps.length; i++) {
       var campItem = camps[i]["@attributes"];
       var campLocals = {};
       campLocals.name = campItem.facilityName ;
       campLocals.status = campItem.availabilityStatus;
       campLocals.latitude = campItem.latitude ;
       campLocals.longitude = campItem.longitude;
       campLocals.water = campItem.sitesWithWaterHookup;
       campLocals.pets = campItem.sitesWithPetsAllowed;
       campLocals.type = campItem.contractType;
       campLocals.Id = campItem.facilityID;
       campLocals.photo = campItem.faciltyPhoto;
       campLocals.power = campItem.sitesWithAmps;
       campLocals.sewer = campItem.sitesWithSewerHookup;
       campSpots.push(campLocals);
     }
//available filters
       function isAvailable(obj){
         return obj === "Y";
        }
       function filterByStatus(campSpots){
         if (isAvailable(campSpots.status)){
           return true;
         }
       return false;
        }
        if ($("#available").val()==="Y"){
           campSpots = campSpots.filter(filterByStatus);
         }else{
         }
//available pets
     function hasPets(obj){
       return obj === "Y";
      }
     function filterByPets(campSpots){
       if (isAvailable(campSpots.pets)){
         return true;
       }
     return false;
      }
      if ($("#pets").val()==="Y"){
         campSpots = campSpots.filter(filterByPets);
       }else{
       }
//available water
      function hasWater(obj){
        return obj === "Y";
       }
      function filterByWater(campSpots){
        if (isAvailable(campSpots.water)){
          return true;
        }
      return false;
       }
       if ($("#water").val()==="Y"){
          campSpots = campSpots.filter(filterByWater);
        }else{
        }
//available sewer
    function hasSewer(obj){
      return obj === "Y";
     }
    function filterBySewer(campSpots){
      if (isAvailable(campSpots.sewer)){
        return true;
      }
    return false;
     }
     if ($("#sewer").val()==="Y"){
        campSpots = campSpots.filter(filterBySewer);
      }else{
      }
//available power
  function hasPower(obj){
    return obj === "Y";
   }
  function filterByPower(campSpots){
    if (isAvailable(campSpots.power)){
      return true;
    }
  return false;
   }
   if ($("#sewer").val()==="Y"){
      campSpots = campSpots.filter(filterByPower);
    }else{
    }

     distance(spot, campSpots);
   }


//finding the closest parks
   function distance(spot, campSpots){
     var list = [];
     var orderList = [];
     for (var i = 0; i < campSpots.length; i++) {
       var campLong = campSpots[i].longitude;
       var campLat = campSpots[i].latitude;
       var d = Math.sqrt((spot.lat - campLat)*(spot.lat - campLat) + (spot.lng - campLong)*(spot.lng - campLong));
       campSpots[i].dist = d;
     }
     campSpots.sort(function(a,b){
      if(a.dist < b.dist)
        return -1;
      if(a.dist > b.dist)
        return 1;
      return 0;
    });

    if (campSpots.length>10){
    for (var j = 0; j < 10; j++) {
     campList(campSpots,j);
    }
    }else{
      for (var k = 0; k < campSpots.length; k++) {
       campList(campSpots,k);
      }
    }
        map.flyTo({
          center: [
            campSpots[0].longitude, campSpots[0].latitude
          ],
          zoom: 9
        });
    mapLoad(campSpots);
   }

   function campList(campSpots,i){
       var li = $("<ol>"+(i+1)+". <a href='https://www.google.com/maps/search/"+campSpots[i].name+"/"+campSpots[i].latitude+","+campSpots[i].longitude+",17z'target='_blank'>"+campSpots[i].name+"</a></ol>");
       $(".campList").append(li);
       $(".map").append("var popup"+i+"= new mapboxgl.Popup({closeOnClick: false})")
         .append(".setLngLat(["+campSpots[i].longitude+", "+campSpots[i].latitude+"])")
         .append(".setHTML("+(i+1)+")")
         .append(".addTo(map)");

   }

//available status checkbar
  $('#available').change(function(){
       if($(this).val()==='Y'){
            $(this).val('N');
       }else{
            $(this).val('Y');
       }
     });

//pets status checkbar
 $('#pets').change(function(){
      if($(this).val()==='Y'){
           $(this).val('N');
      }else{
           $(this).val('Y');
      }
    });
//water status checkbar
$('#water').change(function(){
     if($(this).val()==='Y'){
          $(this).val('N');
     }else{
          $(this).val('Y');
     }
   });
//sewer status checkbar
$('#sewer').change(function(){
    if($(this).val()==='Y'){
         $(this).val('N');
    }else{
         $(this).val('Y');
    }
  });
//power
$('#power').change(function(){
    if($(this).val()==='Y'){
         $(this).val('N');
    }else{
         $(this).val('Y');
    }
  });

//Map creator
mapboxgl.accessToken = 'pk.eyJ1IjoiYXVzdGtlIiwiYSI6ImNpd21uZTB1bDAwNm8yenF4ZmtlbjkzenUifQ.CohFKxWoYGrFXQDoRvZWag';
var map = new mapboxgl.Map({
    container: 'map',
    center: [-105, 39.7],
    attributionControl: true,
    zoom: 7,
    style: 'mapbox://styles/austke/ciwmng4f100es2ppak5unxguy'
  });
  function mapLoad(campSpots){
    var points ={
          "type": "geojson",
          "data": {
              "type": "FeatureCollection",
              "features": []
          }
      };

  //points for loop
  if (campSpots.length<10){
    for (var i = 0; i < campSpots.length; i++) {
        inputPoints(points, campSpots, i);
    }
  }else{
    for (var j = 0; j < 10; j++) {
        inputPoints(points, campSpots, j);
    }
  }
//points JSON maker
  function inputPoints(points, campSpots, i){
    points.data.features.push({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [campSpots[i].longitude, campSpots[i].latitude]
        },
        "properties": {
            "title": i+1,
            "icon": "campsite",
        }
    });
  }
        if (map.getSource("points") === undefined){
        var mapLink = map.addSource("points", points);
        addL();
        }else{
            mapLink = map.removeSource("points");
            addL();
            mapLink = map.addSource("points", points);
        }



//map layer
      function addL(){
        map.addLayer({
          "id": "points",
          "type": "symbol",
          "source": "points",
          "layout": {
              "icon-image": "{icon}-15",
              "text-field": "{title}",
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 0.6],
              "text-anchor": "top"
          }
      });
    }
      //to click links for maps
      mapLink.on("click", function(p){
        var lngDif = [];
        var latDif = [];
        for (var i = 0; i < campSpots.length; i++) {
          lngDif[i] = p.lngLat.lng-campSpots[i].longitude;
          latDif[i] = p.lngLat.lat-campSpots[i].latitude;
          if (lngDif[i] > -0.01 && lngDif[i] < 0.01 && latDif[i] > -0.01 && latDif[i] < 0.01){
            var popup = new mapboxgl.Popup({closeOnClick: true})
                .setLngLat([campSpots[i].longitude, campSpots[i].latitude])
                .setHTML("<a href='https://www.google.com/maps/search/"+campSpots[i].name+"/"+campSpots[i].latitude+","+campSpots[i].longitude+",17z'target='_blank'>"+campSpots[i].name+"</a>")
                .addTo(map);
            }else{

          }
        }
      });
    }




});
//side nav
  function openNav() {
      document.getElementById("mySidenav").style.width = "300px";
  }

  function closeNav() {
      document.getElementById("mySidenav").style.width = "0";
  }
