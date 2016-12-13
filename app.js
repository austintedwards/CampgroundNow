$(function(){
//API Get
  function getCampsites(){
    $.get("http://api.amp.active.com/camping/campgrounds?pstate=CO&api_key=zbbcdmvv4g9dj5xxnhu4r4hh", function(xml){
    var master_obj = xmlToJson(xml);
    getCamp(master_obj);
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
  function getCamp(results){
    var camps = results.resultset.result;
    campLocations(camps);
   }

//cleaning up the objects
   function campLocations(camps){
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
     localStorage.setItem("campSpots", JSON.stringify(campSpots));
   }

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
       var town = city.results[4].formatted_address;
       $("#location").val(town);
     });
   }

//using search to find location of input
   $("#search").click(function(){
     event.preventDefault();
     var town = $("#location").val();
     locationInput(town);
     getCampsites();
     var $spot = localStorage.getItem("spot");
     var spot = JSON.parse($spot);
     var $campSpots = localStorage.getItem("campSpots");
     var campSpots = JSON.parse($campSpots);
     distance(spot, campSpots);
   });

   function locationInput(place){
     $.get("https://maps.googleapis.com/maps/api/geocode/json?address="+place+"&key=AIzaSyAFSPs5znb5ggZ7ZyajBCJMdBiKEXV6UG0",function(town){
       var spot = town.results[0].geometry.location;
      localStorage.setItem("spot", "");
      localStorage.setItem("spot", JSON.stringify(spot));
     });
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
    console.log(campSpots);
     campList(campSpots);
   }

   function campList(campSpots){
     for (var i = 0; i < 10; i++) {
       var li = $("<ol>"+(i+1)+". "+campSpots[i].name+"</ol>");
       $(".campList").append(li);
       $(".map").append("var popup"+i+"= new mapboxgl.Popup({closeOnClick: false})")
         .append(".setLngLat(["+campSpots[i].longitude+", "+campSpots[i].latitude+"39.7])")
         .append(".setHTML('<p>"+(i+1)+"</p>')")
         .append(".addTo(map)");
      }
   }


});
