/**
 * This defines the data model (note that it's not actually used to store
 * data, the data is stored in magical javascript land). It just defines
 * the data model that the getters/setters are based off.
 */
DataModel = {
	motors: {
		head: {
			angle: 0,
			temperature: 0
		},
		neck: {
			angle: 0,
			temperature: 0
		},
		leftSholder: {
			angle: 0,
			temperature: 0
		},
		rightSholder: {
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
	localization: {
		position: [0, 0],
		angle: 0
	}
};