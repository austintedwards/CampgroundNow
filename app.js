$(function(){
  getCampsites();
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
     console.log (campSpots);
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


});
