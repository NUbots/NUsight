Ext.define('NU.util.Network', {
    extend: 'Ext.util.Observable',
    requires: [
        'NU.model.Robot'
    ],
    config: {
        robotIPs: []
    },
    singleton: true,
    constructor: function () {

        var self;

        self = this;

        this.addEvents(
            'robot_ip',
            'sensor_data',
            'vision',
            'localisation'
        );

        self.setupSocket();

        self.callParent(arguments);

        self.builder = dcodeIO.ProtoBuf.loadProtoFile({
            root: "resources/js/proto",
            file: "messages/support/NUbugger/proto/Message.proto"
        });

        window.API = self.builder.build("messages.support.NUbugger.proto");

        return self;

    },
    setupSocket: function () {

        var self, socket;

        self = this;

        socket = io.connect(document.location.origin);

        socket.on('robot_ip', function (robotIP) {

            if (self.robotIPs.indexOf(robotIP) === -1) {

                self.robotIPs.push(robotIP);
                self.fireEvent('robot_ip', robotIP);

            }

        });

        socket.on('message', function (robotIP, message) {

            var api_message, array, stream, eventName;

            api_message = API.Message.decode64(message);

            Ext.iterate(API.Message.Type, function (key, type) {
                if (type === api_message.type) {
                    eventName = key.toLowerCase();
                    return false;
                }
            });

            //console.log(robotIP, eventName);

            self.fireEvent(eventName, robotIP, api_message);
        });

    },
    onRobotIP: function (callback) {

    }
});