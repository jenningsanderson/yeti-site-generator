//Retrieve the GET variables from the URL
function getUrlVars() {var vars = {}; var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {vars[key] = value;}); return vars; }

//Update the shown data depending on the selected users and the time bounds.
function updateMap(){
    
    console.log("Updating the Map")
    
    var filters = [];
    
    //If the brush is not empty, then get the extents...
    if (!brush.empty()){
        
        filters.push( function(f){return f.properties.time > brush.extent()[0]} )
        filters.push( function(f){return f.properties.time < brush.extent()[1]} )
        
        //Show the bounds of the brush
        document.getElementById("brush-bounds").innerHTML = "<h4 style='float:left;margin-left:5px'>"+brush.extent()[0].toISOString()+"</h4>" + "<h4 style='float:right;margin-right:5px;'>"+brush.extent()[1].toISOString()+"</h4>";
    }
    
    // Get the checked elements that are checked (separated by user properties.user by default)
    var checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');

    if (checkedBoxes.length > 0){
        users = _.map(checkedBoxes, function(b){return b.id.toString()});
        filters.push(function(f){return users.indexOf(f.properties.user) >= 0})
    }
    
    //filters is now an array of functions that better return true for every object
    apply_filters = function(feature){
        for (idx in filters){
            if (filters[idx](feature) == false){return false}
        }
        return true
    }
    
    //Apply to the filters to the layer
    pointDataOnMap.setFilter(apply_filters)
    
    map.fitBounds(pointDataOnMap.getBounds());
    
    updateSideBarContent()
    
 
}

function updateSideBarContent(){
    layers = _.sortBy(pointDataOnMap.getLayers(), function(i){return i.feature.properties.time});
    var contents = document.getElementById('content')
    //Clear existing
    while(contents.firstChild){
      contents.removeChild(contents.firstChild);
    }
    layers.forEach(function(layer, idx){
        var obj = document.createElement('li');
            obj.id = 'content-object-' + idx.toString()
            obj.setAttribute('class','content-item')
            obj.innerHTML = '<h4>' + layer.feature.properties.user + '</h4>' +
                            '<h5>' + new Date(layer.feature.properties.time) + '</h5>' + 
                            '<p>'  + layer.feature.properties.text + '</p>'
        contents.appendChild(obj)
    });
    
}

function setBrush(data) {
    var container = d3.select('#brush'),
        width = container.node().offsetWidth,
        margin = {top: 0, right: 0, bottom: 0, left: 0},
        height = 50;

    var timeExtent = d3.extent(data.features, function(d) {
        return d.properties.time;
    });

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
         .on('brushend', updateMap);

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

function pointColor(feature) {
    return colors20(feature.properties.user);
}

function pointRadius(feature) {
    return 5;
}

function pointMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: pointRadius(feature),
        fillColor: pointColor(feature),
        fillOpacity: 0.7,
        weight: 0.5,
        color: '#fff'
    }).bindPopup(
        '<h2>' + feature.properties.user + '</h2>' +
        '<h3>' + new Date(feature.properties.time) + '</h3>' + 
        '<p>'  + feature.properties.text + '</p>');}


/*
     Global Variables
     
*/

var colors20 = d3.scale.category20();
var filterGroup = document.getElementById('filter-group');
var brush = d3.svg.brush();
//var dataset = getUrlVars()['dataset'] || '/nbserver/chime_output/red_hook_geo_users/anneeoanneo.json'
//var dataset = getUrlVars()['dataset'] || '/nbserver/chime_output/tweets_in_redhook.geojson'
var dataset = getUrlVars()['dataset'] || '../sample_data/tweets_in_redhook.geojson'

var pointDataOnMap = L.mapbox.featureLayer(null, { pointToLayer: pointMarker }).addTo(map);



console.log("Dataset: " + dataset)


// Main runtime( Load the json file and process)

d3.json(dataset, function(err, geojson) {

    geojson.features = geojson.features.map(function(d) {
        d.properties.time = new Date(d.properties.time);
        d.properties.timeInt = d.properties.time.getTime();
        d.properties.layerColor = colors20(d.properties.user);
        return d;
    })

    var grouped      = _.groupBy(geojson.features,function(d){return d.properties.user})
    var users_with_counts = _.reverse(_.sortBy(_.map(grouped,function(k,v){return {user: v, feats: grouped[v].length}}),function(d){return d['feats']}))

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
    
    setBrush(geojson)
    
    //Add the GeoJSON layer to the map
    pointDataOnMap.setGeoJSON(geojson);
});
