$(function(){
  getCampsites();

  function getCampsites(){
    $.get("http://api.amp.active.com/camping/campgrounds?pstate=CO&api_key=zbbcdmvv4g9dj5xxnhu4r4hh", function(xml){
    getCamp(xml);
    console.log(xml);
    });
  }

  function getCamp(xml){
    var data = xml.response;
    console.log(data);

  }


});
