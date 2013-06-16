/**
 * This object builds a Data model from a passed object template. This data
 * model can then be bound to by listening to events.
 */
(function (CustomEvent, document) {
	"use strict";

	var Modeler, model, modelValue, modelArray, isObject, isArray, TAG;

	//The element type we use internally for dom elements
	TAG = "a";

	//The object that we will export to the world
	Modeler = {};

	/**
     * Checks if the passed object is an instance of Object
     *
     * @param object the object to check
     */
	isObject = function (object) {
		//Check if it is an object
		return Object.prototype.toString.call(object) === '[object Object]';
	};

	/**
     * Checks if the passed object is an array
     *
     * @param object the object to check
     */
	isArray = function (object) {
		//Check if it is an array
		return Object.prototype.toString.call(object) === '[object Array]';
	};

	/**
     * This method builds an object which has a getter/setter and stores the
     * value in it. This is the object which is accessed to get the data and
     * add callbacks.
     *
     * @param initial the initial value for the variable
     * @param element the parent element to add ourselves to (to bubble up)
     */
	modelValue = function (initial, element) {
		var value, ourElement, handler;

		//Store our values in magical javascript land!!
		value = initial;

		//This is the DOM object we will use to fire events
		ourElement = document.createElement(TAG);
		element.appendChild(ourElement);

		//Create our handler object
		handler = {};

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
				var temp, event;
				temp = value;
				value = newValue;

				event = new CustomEvent("update", {
					bubbles: true,
					detail: {
						oldValue: temp,
						newValue: newValue
					}
				});

				ourElement.dispatchEvent(event);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define an onUpdate method (binds to the update event)
		Object.defineProperty(handler, "onUpdate", {
			value: function (action) {
				ourElement.addEventListener("update", action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define an unbind method (removes an event binding to the update event)
		Object.defineProperty(handler, "unbind", {
			value: function (action) {
				ourElement.removeEventListener(action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		return handler;
	};

	/**
     * This method builds a special getter/setter for an array. The array as a
     * whole can be set (throwing an event on the array and its components) or
     * each of the array elements can be set (also throwing an event on both the
     * array and the element that was changed)
     *
     * @param arr     the array to build the getter/setter for
     * @param element the element to add ourselves to (for bubbling)
     */
	modelArray = function (arr, element) {
		var ourElement, dataarr, i;

		ourElement = document.createElement(TAG);
		element.appendChild(ourElement);

		dataarr = [];

		//Define an onUpdate method (binds to the update event)
		Object.defineProperty(dataarr, "onUpdate", {
			value: function (action) {
				ourElement.addEventListener("update", action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define an unbind method (removes an event binding to the update event)
		Object.defineProperty(dataarr, "unbind", {
			value: function (action) {
				ourElement.removeEventListener(action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Loop through all our keys
		for (i = 0; i < arr.length; i++) {

			//If it's an object then it's another layer
			if (isObject(arr[i])) {
				Object.defineProperty(dataarr, i, {
					value: model(arr[i], ourElement),
					writable: false,
					enumerable: true,
					configurable: true
				});
			}

			//If it's an array then build the special array manager
			else if(isArray(arr[i])) {
				Object.defineProperty(dataarr, i, {
					value: modelArray(arr[i], ourElement),
					writable: false,
					enumerable: true,
					configurable: true
				});
			}

			//Otherwise just build our getter/setter
			else {
				Object.defineProperty(dataarr, i, {
					value: modelValue(arr[i], ourElement),
					writable: false,
					enumerable: true,
					configurable: true
				});
			}
		}

		return dataarr;
	};

	/**
     * Builds the data model. Creates setters/getters and onUpdates for every
     * element in the data model
     *
     * @param object the object level which we are building getters/setters for
     * @param element the dom element to inherit components here from
     */
	model = function (object, element) {
		var key, dataobj, ourElement;

		//Create our DOM element
		ourElement = document.createElement(TAG);

		//Add it to the parent (so it can bubble)
		element.appendChild(ourElement);

		//The object we will return
		dataobj = {};

		//Define an onUpdate method (binds to the update event)
		Object.defineProperty(dataobj, "onUpdate", {
			value: function (action) {
				ourElement.addEventListener("update", action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Define an unbind method (removes an event binding to the update event)
		Object.defineProperty(dataobj, "unbind", {
			value: function (action) {
				ourElement.removeEventListener(action);
			},
			writable: false,
			enumerable: true,
			configurable: true
		});

		//Loop through all our keys
		for (key in object) {
			if (object.hasOwnProperty(key)) {

				//If it's an object then it's another layer
				if (isObject(object[key])) {
					Object.defineProperty(dataobj, key, {
						value: model(object[key], ourElement),
						writable: false,
						enumerable: true,
						configurable: true
					});
				}

				//If it's an array then build the special array manager
				else if(isArray(object[key])) {
					Object.defineProperty(dataobj, key, {
						value: modelArray(object[key], ourElement),
						writable: false,
						enumerable: true,
						configurable: true
					});
				}

				//Otherwise just build our getter/setter
				else {
					Object.defineProperty(dataobj, key, {
						value: modelValue(object[key], ourElement),
						writable: false,
						enumerable: true,
						configurable: true
					});
				}
			}
		}

		//Return the object (either to be put in another object or as the final)
		return dataobj;
	};

	//Attach the buildGetterSetter method
	Object.defineProperty(Modeler, "model", {
		value: function (x) {
			return model(x, document.body);
		},
		writable: false,
		enumerable: true,
		configurable: true
	});

	//Export our Modeler to the world!
	window.Modeler = Modeler;
}(window.CustomEvent, window.document));