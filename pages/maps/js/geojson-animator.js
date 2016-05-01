//Retrieve the GET variables from the URL
function getUrlVars() {var vars = {}; var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {vars[key] = value;}); return vars; }

//http://stackoverflow.com/questions/1050720/adding-hours-to-javascript-date-object
Date.prototype.addHours = function(h)   {this.setTime(this.getTime() + (h*60*60*1000)); return this;}
Date.prototype.subHours = function(h)   {this.setTime(this.getTime() - (h*60*60*1000)); return this;}
Date.prototype.addMinutes = function(m) {this.setTime(this.getTime() + (m*60*1000));  return this;}

//This is the update function that gets called on every brush move, so make sure it stays light...
function updateMap(){
    filters = []//Clear existing filters
    
    //If the brush is not empty, then get the extents and add the filter
    if (!brush.empty()){
        
        filters.push( function(f){return f.properties.time > brush.extent()[0]} )
        filters.push( function(f){return f.properties.time < brush.extent()[1]} )
        
        //Show the bounds of the brush
        document.getElementById("brush-bounds").innerHTML = "<h4 style='float:left;margin-left:5px'>"+brush.extent()[0].toISOString()+"</h4>" + "<h4 style='float:right;margin-right:5px;'>"+brush.extent()[1].toISOString()+"</h4>";
    }
    
    //If user boxes are checked, then get the names and add them as a filter
    var checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    if (checkedBoxes.length > 0){
        users = _.map(checkedBoxes, function(b){return b.id.toString()});
        filters.push(function(f){return users.indexOf(f.properties.user) >= 0})
    }
    
    //Apply to the filters to the layer
    geoJSONDataOnMap.setFilter(function(feature){
        for (idx in filters){
            if (filters[idx](feature) == false){return false}
        }
        return true
    });
}//end updateMap()


//function updateSideBarContent(){
//    layers = _.sortBy(geoJSONDataOnMap.getLayers(), function(i){return i.feature.properties.time});
//    var contents = document.getElementById('content')
//    //Clear existing
//    while(contents.firstChild){
//      contents.removeChild(contents.firstChild);
//    }
//    
//    //Doesn't work to just go through the layers, because the _null_ doesn't exist there; but we can worry about that in the future?
//    layers.forEach(function(layer, idx){
//        var obj = document.createElement('li');
//            obj.id = 'content-object-' + idx.toString()
//            obj.setAttribute('class','content-item')
//            obj.innerHTML = '<h4>' + layer.feature.properties.user + '</h4>' +
//                            '<h5>' + new Date(layer.feature.properties.time) + '</h5>' + 
//                            '<p>'  + layer.feature.properties.text + '</p>' //+ 
//                           // '<p>'  + JSON.stringify(layer.feature.geometry) + '</p>'
//        contents.appendChild(obj)
//    });
//    
//}

//Build and set the brush at the top of the page
function setBrush(data) {
    var container = d3.select('#brush'),
        width = container.node().offsetWidth,
        margin = {top: 0, right: 0, bottom: 0, left: 0},
        height = 50;

    timeExtent = d3.extent(data.features, function(d) {
        return d.properties.time;
    });
    
    timeExtent = [timeExtent[0].subHours(1), timeExtent[1].addHours(1)]

    var svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' +
            margin.left + ',' +
            margin.top + ')');

    var x = d3.time.scale()
        .range([0, width])
        .domain(timeExtent);

    brush.x(x)
         .on('brush', updateMap);

    context.selectAll('circle')
        .data(data.features)
        .enter()
        .append('circle')
        .attr('transform', function(d) {
            return 'translate(' + [x(d.properties.time), height / 2] + ')';
        })
        .attr('r', 2)
        .attr('opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('fill', function(d){return colors20(d.properties.user)});

    context.append('g')
        .attr('class', 'x brush')
        .call(brush)
        .selectAll('rect')
        .attr('y', -6)
        .attr('height', height);
}

function geoJSONStyle(feature){
    return {color: colors20(feature.properties.user),
            opacity: 1,
            weight: 3}
}

function geoJSONPoint(feature, latlng){
    return L.circleMarker(latlng, {
        radius: 2,
        fillColor: colors20(feature.properties.user),
        fillOpacity: 1,
        weight: 1,
        color: '#fff'
    }).bindPopup(
        '<h2>' + feature.properties.user + '</h2>' +
        '<h3>' + new Date(feature.properties.time) + '</h3>' + 
        '<p>'  + feature.properties.text + '</p>');
}


function geoJSONPopUp(feature, layer){
    layer.bindPopup(
        '<h2>' + feature.properties.user + '</h2>' +
        '<h3>' + new Date(feature.properties.time) + '</h3>' + 
        '<p>'  + JSON.stringify(feature.properties.text) + '</p>');
}




///////////////////////////////         ANIMATION FUNCTIONS

function animateBrush(){
    console.log("Starting animation")
    
    non_cumulative = JSON.parse($('input[name="cumulative"]:checked').val());
    minutes        = parseInt( $('input[name="minute-step"]').val() )
    milliseconds   = parseInt( $('input[name="interval"]').val())
    
    console.log(timeExtent)
    
    animator = setInterval(function(){
        //Always increment the tail extent
        var new_extent = [ brush.extent()[0], brush.extent()[1].addMinutes(minutes) ]
        //If we don't want to be cumulative, then increment the beginning
        if(non_cumulative){ new_extent[0] = new_extent[0].addMinutes(minutes) }
        d3.select('#brush')
            .call(brush.extent(new_extent))
            .call(brush.event)
        
       if(new_extent[1] > timeExtent[1]){stopAnimation()}
        
    },milliseconds);
}

function stopAnimation(){
    console.log("Stopping animation...")
    var highestTimeoutId = setTimeout(";");
        for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i); 
    }
    d3.select('#brush')
            .call(brush.clear())
}
  
/////////////////////   GLOBAL VARS    ////////////////////////
var colors20 = d3.scale.category20();
var filterGroup = document.getElementById('filter-group');
var brush = d3.svg.brush();
var timeExtent = [];
var filters = [];
var animator;
//var dataset = getUrlVars()['dataset'] || '/nbserver/chime_output/red_hook_geo_users/anneeoanneo.json'
//var dataset = getUrlVars()['dataset'] || '/nbserver/chime_output/tweets_in_redhook.geojson'
//var dataset = getUrlVars()['dataset'] || '../sample_data/tweets_in_redhook.geojson'

var dataset = getUrlVars()['dataset'] || '../sample_data/haiti-ways-2.geojson'

//var pointDataOnMap = L.mapbox.featureLayer(null, { pointToLayer: pointMarker }).addTo(map);

var geoJSONDataOnMap = L.mapbox.featureLayer(null,{
                                                style: geoJSONStyle,
                                                pointToLayer: geoJSONPoint,
                                                onEachFeature: geoJSONPopUp}).addTo(map);
console.log("Dataset: " + dataset)

/////////////////////      Main runtime( Load the json file and process)
d3.json(dataset, function(err, geojson) {
    
    // Set some valid default values for 'text' and 'time'
    geojson.features = geojson.features.map(function(d) {
        if (d.properties.time == undefined){ d.properties.time = new Date(d.properties.date)}else{d.properties.time = new Date(d.properties.time); }
        if (d.properties.text == undefined){ d.properties.text = d.properties.comment; }
        d.properties.timeInt = d.properties.time.getTime();
        d.properties.layerColor = colors20(d.properties.user);
        return d;
    })

    // Group the data for filtering what's visible
    var grouped      = _.groupBy(geojson.features,function(d){return d.properties.user})
    var users_with_counts = _.reverse(_.sortBy(_.map(grouped,function(k,v){return {user: v, feats: grouped[v].length}}),function(d){return d['feats']}))

    //Create the labels on the left-hand-side
    users_with_counts.forEach(function(obj,idx){
        var input = document.createElement('input');
            input.type = 'checkbox';
            input.id = obj['user'];
            input.checked = false;
            filterGroup.appendChild(input);

        var label = document.createElement('label');
            label.setAttribute('for', obj['user']);
            label.textContent = obj['user'] + " | " +obj['feats'];
            filterGroup.appendChild(label);

            input.addEventListener('change', function(e) {
                updateMap()
            });
    })
    
    //Create the timeline
    setBrush(geojson)
    
    //Add the GeoJSON layer to the map
    geoJSONDataOnMap.setGeoJSON(geojson);
    map.fitBounds(geoJSONDataOnMap.getBounds());
});