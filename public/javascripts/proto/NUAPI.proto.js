"use strict";
/** @suppress {duplicate}*/var API;
if (typeof(API)=="undefined") {API = {};}

API.Message = PROTO.Message("API.Message",{
	Type: PROTO.Enum("API.Message.Type",{
		SENSOR_DATA :1,
		VISION :2,
		LOCALISATION :3,
		DATA_POINT :4	}),
	type: {
		options: {},
		multiplicity: PROTO.required,
		type: function(){return API.Message.Type;},
		id: 1
	},
	utc_timestamp: {
		options: {},
		multiplicity: PROTO.required,
		type: function(){return PROTO.uint64;},
		id: 2
	},
	sensor_data: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.SensorData;},
		id: 3
	},
	vision: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.Vision;},
		id: 4
	},
	localisation: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.Localisation;},
		id: 5
	},
	dataPoint: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.DataPoint;},
		id: 6
	}});
API.DataPoint = PROTO.Message("API.DataPoint",{
	label: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.string;},
		id: 1
	},
	value: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return PROTO.Float;},
		id: 2
	}});
API.Image = PROTO.Message("API.Image",{
	width: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 1
	},
	height: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 2
	},
	data: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.bytes;},
		id: 3
	}});
API.VisionFieldObject = PROTO.Message("API.VisionFieldObject",{
	Type: PROTO.Enum("API.VisionFieldObject.Type",{
		CIRCLE :1,
		RECTANGLE :2,
		POLYGON :3,
		UNKNOWN :4	}),
	type: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.VisionFieldObject.Type;},
		id: 1
	},
	id: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 2
	},
	name: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.string;},
		id: 3
	},
	visible: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.bool;},
		id: 4
	},
	screen_x: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 5
	},
	screen_y: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 6
	},
	rotation: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 7
	},
	radius: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 8
	},
	width: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 9
	},
	height: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 10
	},
	points: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return PROTO.uint32;},
		id: 11
	},
	measured_relative_position: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return PROTO.Float;},
		id: 12
	}});
API.VisionClassifiedSegment = PROTO.Message("API.VisionClassifiedSegment",{
	start_x: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 1
	},
	start_y: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 2
	},
	end_x: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 3
	},
	end_y: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 4
	},
	colour: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 5
	}});
API.VisionClassifiedImage = PROTO.Message("API.VisionClassifiedImage",{
	num_segments: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.uint32;},
		id: 1
	},
	segment: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return API.VisionClassifiedSegment;},
		id: 2
	}});
API.Vision = PROTO.Message("API.Vision",{
	image: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.Image;},
		id: 1
	},
	field_object: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return API.VisionFieldObject;},
		id: 2
	},
	classified_image: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.VisionClassifiedImage;},
		id: 3
	}});
API.Motor = PROTO.Message("API.Motor",{
	name: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.string;},
		id: 1
	},
	position: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 2
	},
	velocity: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 3
	},
	acceleration: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 4
	},
	target: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 5
	},
	stiffness: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 6
	},
	current: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 7
	},
	torque: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 8
	},
	temperature: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 9
	}});
API.SensorData = PROTO.Message("API.SensorData",{
	motor: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return API.Motor;},
		id: 1
	},
	accelerometer: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.Vector;},
		id: 2
	},
	gyro: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.Vector;},
		id: 3
	},
	orientation: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return API.Vector;},
		id: 4
	}});
API.LocalisationFieldObject = PROTO.Message("API.LocalisationFieldObject",{
	name: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.string;},
		id: 1
	},
	wm_x: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 2
	},
	wm_y: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 3
	},
	sd_x: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 4
	},
	sd_y: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 5
	},
	sr_xx: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 6
	},
	sr_xy: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 7
	},
	sr_yy: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 8
	},
	heading: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 9
	},
	sd_heading: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.Float;},
		id: 10
	},
	lost: {
		options: {},
		multiplicity: PROTO.optional,
		type: function(){return PROTO.bool;},
		id: 11
	}});
API.Localisation = PROTO.Message("API.Localisation",{
	field_object: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return API.LocalisationFieldObject;},
		id: 1
	}});
API.Vector = PROTO.Message("API.Vector",{
	float_value: {
		options: {},
		multiplicity: PROTO.repeated,
		type: function(){return PROTO.Float;},
		id: 1
	}});
