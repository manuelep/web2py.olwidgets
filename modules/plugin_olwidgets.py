#!/usr/bin/env python
# coding: utf8
from gluon import *

from json import dumps as jsdumps

from geojson import FeatureCollection
from geojson import loads as gjsloads
from geojson import dumps as gjsdumps
from json import dumps as jsdumps

plugin_root = 'static/plugin_olwidgets'

def getUUID():
    """ Returns random identifier """
    import uuid
    UUID = str(uuid.uuid1()).split('-')[0]
    return UUID

def injectMap(value, map_id=None, input_id=None, input_name=None,
    input_class='json', widget='initPointMap', edit_mode=False, **kwargs):
    """ Returns tags I need to build my map """

    if None in (map_id, input_id, ):
        UUID = getUUID()
        if map_id is None:
            map_id = "map_%s" % UUID
        if input_id is None:
            input_id = "feature_source_%s" % UUID

    ValueTag = INPUT(
        _id = input_id,
        _name = input_name or "feature_source",
        _value = value,
        _class = input_class,
        _type = "hidden",
    )
    params = dict(_style = "width: 350px", _class = "smallmap")
    params.update(dict([('_%s' % k, v) for k,v in kwargs.items()]))
    MapTag = DIV(_id = map_id, **params)

    ollib = SCRIPT(_src=URL(plugin_root, 'openlayers/lib/OpenLayers.js'))
    mylib = SCRIPT(_src=URL(plugin_root, 'widgets.js'))
    elements = dict(
        widgetname = widget,
        map_options = jsdumps(dict(div=map_id)),
        myinput = input_id,
        viewmode = 'false' if edit_mode else 'true'
    )
    callmapscript = SCRIPT(
        'jQuery( document ).ready( %(widgetname)s("%(myinput)s", %(map_options)s, %(viewmode)s) )' % elements,
        _type = "text/javascript",
    )
    return SPAN(ollib, mylib, ValueTag, MapTag, callmapscript)

def map_represent(value, row):
    """ """
    return injectMap(value, map_id=None, input_id=None, widget='initPointMap', edit_mode=False)

def mapPoint_widget(field, value):
    """ """
    input_id = "%s_%s" % (field._tablename, field.name)
    map_id = "map_%s" % input_id
    return injectMap(value, map_id=map_id, input_id=input_id, input_name=field.name, input_type=field.type, widget='initPointMap', edit_mode=True)


def featStore(rows):
    collection = FeatureCollection(map(lambda row: gjsloads(row.localization)['features'][0], rows))
    for nn,ff in enumerate(collection["features"]):
        if rows[nn].is_active:
            ff['properties']['icon'] = URL(plugin_root, 'openlayers/img/marker-green.png')
        else:
            ff['properties']['icon'] = URL(plugin_root, 'openlayers/img/marker.png')
    return gjsdumps(collection)
