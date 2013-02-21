/**
 * This builds and holds the data which is required for the system
 */
(function (CustomEvent, document, toString) {
	"use strict";

	var DataModel, buildDataObject, buildGetterSetter, isObject;

	/**
	 * This defines the data model (note that it's not actually used to store
	 * data, the data is stored in magical javascript land). It just defines
	 * the data model that the getters/setters are based off.
	 */
	DataModel = {
		robot: {
			motors: {
				head: {
					angle: 0,
					temperature: 0
				},
				neck: {
					angle: 0,
					temperature: 0
				},
				leftShoulder: {
					angle: 0,
					temperature: 0
				},
				rightShoulder: {
					angle: 0,
					temperature: 0
				},
				leftUpperArm: {
					angle: 0,
					temperature: 0
				},
				rightUpperArm: {
					angle: 0,
					temperature: 0
				},
				leftLowerArm: {
					angle: 0,
					temperature: 0
				},
				rightLowerArm: {
					angle: 0,
					temperature: 0
				},
				leftPelvisY: {
					angle: 0,
					temperature: 0
				},
				rightPelvisY: {
					angle: 0,
					temperature: 0
				},
				leftPelvis: {
					angle: 0,
					temperature: 0
				},
				rightPelvis: {
					angle: 0,
					temperature: 0
				},
				leftUpperLeg: {
					angle: 0,
					temperature: 0
				},
				rightUpperLeg: {
					angle: 0,
					temperature: 0
				},
				leftLowerLeg: {
					angle: 0,
					temperature: 0
				},
				rightLowerLeg: {
					angle: 0,
					temperature: 0
				},
				leftAnkle: {
					angle: 0,
					temperature: 0
				},
				rightAnkle: {
					angle: 0,
					temperature: 0
				},
				leftFoot: {
					angle: 0,
					temperature: 0
				},
				rightFoot: {
					angle: 0,
					temperature: 0
				}
			},
			sensors: {
				accelerometer: [0, 0, 0],
				gyroscope: [0, 0, 0],
				orientation: [0, 0],
				battery: 0
			},
			localisation: {
				position: [0, 0],
				angle: 0
			}
		}
	};

	/**
	 * Checks if the passed object is an instance of Object
	 */
	isObject = function (object) {
		//Check if it is an object
		return toString.call(object) === '[object Object]';
	};

	/**
	 * This method builds an object which has a getter/setter and stores the
	 * value in it. This is the object which is accessed to get the data and
	 * add callbacks.
	 *
	 * @param initial the initial value for the variable
	 */
	buildGetterSetter = function (initial) {
		var value, eventObject;

		//Store our values in magical javascript land!!
		value = initial;

		//This is the DOM object we will use to fire events
		eventObject = document.createElement("e");

		//Create our handler object
		var handler = {};

		//Define a get property (gets the value)
		Object.defineProperty(handler, "get", {
			value: function () {
				return value;
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define a set property (sets the value and fires the event
		Object.defineProperty(handler, "set", {
			value: function (newValue) {
				var temp;
				temp = value;
				value = newValue;

				var event = new CustomEvent("update", {
					detail:{
						oldValue:temp,
						newValue: newValue
					}
				});

				eventObject.dispatchEvent(event);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define an onUpdate method (binds to the update event)
		Object.defineProperty(handler, "onUpdate", {
			value: function (action) {
				eventObject.addEventListener("update", action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define an unbind method (removes an event binding to the update event)
		Object.defineProperty(handler, "unbind", {
			value: function (action) {
				eventObject.removeEventListener(action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		return handler;
	};

	/**
	 * Builds the data model. Creates setters/getters and onUpdates for every
	 * element in the data model
	 *
	 * @param object the object level which we are building getters/setters for
	 */
	buildDataObject = function (object) {
		var key, dataobj;

		//The object we will return
		dataobj = {};

		//Loop through all our keys
		for (key in object) {
			if (object.hasOwnProperty(key)) {
				//Check if they are objects or something else
				if (isObject(object[key])) {
					//If it's an object then build its children
					dataobj[key] = buildDataObject(object[key]);
				}
				//Otherwise build a getter/setter for this
				else {
					dataobj[key] = buildGetterSetter(object[key]);
				}
			}
		}

		//Return the object (either to be put in another object or as the final)
		return dataobj;
	};

	//Export our data object to the world!
	window.Data = buildDataObject(DataModel);
}(window.CustomEvent, window.document, window.toString));