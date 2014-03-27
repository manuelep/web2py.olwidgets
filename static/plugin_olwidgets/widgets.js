/* Define here under all map widget you need.
   Every map widget is an island. */

function initMarkersMap(input_id, map_options) {
    /* Just a summary map that shows a marker for every point saved in the table.

       Options parameters:
       input_id {string} id of the input tag where to read my map content;
       map_options {object} options to be passed to map constructor.
    */

    epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var map = new OpenLayers.Map( map_options || {} );
    var oslayer = new OpenLayers.Layer.OSM( "Simple OSM Map" );
    map.addLayer(oslayer);

    var markers = new OpenLayers.Layer.Markers( "Markers" );
    var inputvalue = jQuery( "#"+input_id ).val() || '';

    var featureCollection = null;
    if ( inputvalue!='' ) {
        featureCollection = jQuery.parseJSON(inputvalue);
        for ( var i=0; i<featureCollection['features'].length; i++ ) {
            var feat = featureCollection['features'][i];
            var geom = feat.geometry;
            var markerslonLat = new OpenLayers.LonLat( geom.coordinates );
            var markericon = new OpenLayers.Icon(feat['properties']['icon']);
            markers.addMarker(new OpenLayers.Marker(markerslonLat, markericon));
        }
        map.addLayer(markers);
        var bounds = markers.getDataExtent();
        map.zoomToExtent(bounds)
    } else {
        var point =  new OpenLayers.LonLat(12.442285, 41.923249);
        var zoom = 4;
        map.setCenter(point.transform(epsg4326, map.getProjectionObject()), zoom)
    }
};


function initPointMap(input_id, map_options, view_only){
    /* a widget for add/edit just a single point in my geometry field.
       Features are read and stored in the specified input tag.

       Options parameters:
       input_id {string} id of the input tag where to read my map content;
       map_options {object} options to be passed to map constructor;
       view_only {boolean} if true map edit controls are not set.
    */

    epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var gjf = new OpenLayers.Format.GeoJSON();

    var map = new OpenLayers.Map(map_options || {});

    var osmlayer = new OpenLayers.Layer.OSM( "Simple OSM Map" );
    var vlayer = new OpenLayers.Layer.Vector( "Editable", { geometryType: OpenLayers.Geometry.Point } );

    /* Load data from store input tag */
    var inputvalue = jQuery( "#"+input_id ).val() || '';
    var featureCollection = null;
    if ( inputvalue!='' ) {
        featureCollection = jQuery.parseJSON(inputvalue);
        jQuery( "#"+input_id ).val(featureCollection);
        loadedCollection = gjf.read(featureCollection);
        vlayer.addFeatures( loadedCollection )
    };

    var panelControls = [
        new OpenLayers.Control.Navigation(),
    ];
    var toolbar = new OpenLayers.Control.Panel({
        displayClass: 'olControlEditingToolbar',
    });

    /* Editing control */
    if ( view_only!=true ) {

        panelControls.push(new OpenLayers.Control.DrawFeature(vlayer,
            OpenLayers.Handler.Point,
            {'displayClass': 'olControlDrawFeaturePoint'}))};

        toolbar.defaultControl = panelControls[panelControls.length-1]

    toolbar.addControls(panelControls);

    map.addControl(toolbar);
    map.addLayers([osmlayer, vlayer]);

    if ( vlayer.features.length>1 ) {
        // not used.
        var bounds = vlayer.getDataExtent();
        map.zoomToExtent(bounds)
    } else if ( vlayer.features.length==1 ) {
        var geom = vlayer.features[0].geometry.clone();
        geom.transform(map.getProjectionObject(), epsg4326);
        var point =  new OpenLayers.LonLat(geom.x, geom.y);
        var zoom = 7
        map.setCenter(point.transform(epsg4326, map.getProjectionObject()), zoom);
    } else {
        var point =  new OpenLayers.LonLat(12.442285, 41.923249);
        var zoom = 4;
        map.setCenter(point.transform(epsg4326, map.getProjectionObject()), zoom)
    };

    /* Events register */
    // In this case I want just one point for a record.
    // That's why all features are removed before each time a feature is added.
    vlayer.events.register('beforefeatureadded', vlayer,
        function (e) { vlayer.removeAllFeatures() });
    vlayer.events.register('featureadded', vlayer,
        function (e) { jQuery( "#"+input_id ).val(gjf.write(vlayer.features)) });
};
