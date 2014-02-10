/*global define*/

define([
    'underscore',
    'backbone',
    'models/stop'
], function (_, Backbone, StopModel) {
    'use strict';

    var StopCollection = Backbone.Collection.extend({
        model: StopModel
    });

    return StopCollection;
});
