Ext.define('NU.view.factory.angle.AngleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Angle',
    draw: null,
    centre: null,
    radius: null,
    line: null,
    widget: null,
    onAfterRender: function (container) {
        this.renderComponents(container);
    },
    /**
     * Renders the circle and line for the angle view.
     *
     * @param view The angle view.
     */
    renderComponents: function (view) {
        // get the dimensions from the view
        var dimensions = view.getDimensions();
        var width =  dimensions.width;
        var height = dimensions.height;
        // set the radius of the circle
        this.radius = width * 0.5;
        // calculate the centre of the circle
        this.centre =  {
            x: this.radius,
            y: this.radius
        };
        // create the SVG drawing context
        this.draw = SVG(view.id).size(width, height).viewbox(0, 0, width, height);
        // create the drawing group
        this.widget = this.draw.group();
        // draw the default circle and line
        this.drawCircle().click(this.onClick.bind(this));
        this.drawLine({
            x: 0,
            y: this.radius
        });
    },
    /**
     * Draws a circle in the default position.
     */
    drawCircle: function () {
        var circle = this.draw.circle(this.radius * 2).fill({
            color: '#ddd'
        });
        this.widget.add(circle);
        return circle;
    },
    /**
     * Draws a line in the default position of the circle.
     *
     * @param endpoint The endpoint to draw the line at. This is an object that contains an x and y coordinate.
     */
    drawLine: function (endpoint) {
        // create the line
        var line = this.draw.path(this.calculatePath(endpoint)).stroke({
            color: '#555',
            width: 2
        });
        this.widget.add(line);
        return line;
    },
    /**
     * Calculates the path of the line given the endpoint.
     *
     * @param endpoint The final point on the line.
     */
    calculatePath: function (endpoint) {
        return Ext.String.format('M {0},{1} L {2},{3}', this.centre.x, this.centre.y,
                endpoint.x + this.centre.x, -endpoint.y + this.centre.y);
    },
    onClick: function (event) {
        var bound = this.widget.node.getBoundingClientRect();
        var x = event.x - bound.left - this.centre.x;
        var y = -(event.y - bound.top - this.centre.y);
        var length = Math.sqrt(x * x + y * y);              // calculate the length of the vector
        var unit = {                                        // calculate the unit vector
            x: x / length,
            y: y / length
        };
        var endpoint = {
            x: unit.x * this.radius,
            y: unit.y * this.radius
        };
        //var angle = Math.atan2(unit.y, unit.x);
        if (this.line === null) {
            this.line = this.drawLine(endpoint);            // create the path if it does not exist
        } else {
            this.line.plot(this.calculatePath(endpoint));   // update the path
        }
    }
});
