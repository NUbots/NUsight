// Copies the google protobuf messages to the correct location
var ncp = require('ncp').ncp;

ncp('node_modules/protobufjs/sandbox/gapi/googleapis', 'public/resources/js/proto', function (err) {
    if (err) {
        return console.error(err);
    }
});