Ext.define('NU.controller.Field', {
    extend: 'Ext.app.Controller',
    init: function () {

        /*this.control({
            'nu.field_window': {
                afterRender: function () {

                    console.log('wat');

                }
            }
        });*/
        NU.util.Network.on('robot_ip', Ext.bind(this.onRobotIP, this));
        NU.util.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
        NU.util.Network.on('localisation', Ext.bind(this.onLocalisation, this));

    },
    onRobotIP: function (robotIP) {

        console.log(robotIP);

    },
    onSensorData: function (robotIP, api_message) {

    },
    onLocalisation: function (robotIP, api_message) {

    }
});