"use strict";
/** @suppress {duplicate}*/var API;
if (typeof(API)=="undefined") {API = {};}

API.Pixel = PROTO.Message("API.Pixel",{
	y: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 1
	},
	cb: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 2
	},
	cr: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 3
	}});
API.Image = PROTO.Message("API.Image",{
	pixel: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return API.Pixel;},
		id: 1
	}});
