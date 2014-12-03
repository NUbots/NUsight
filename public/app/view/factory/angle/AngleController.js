Ext.define('NU.view.factory.angle.AngleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Angle',
    draw: null,
    centre: null,
    radius: null,
    circle: null,
    angle: null,
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
        this.centre =  {
            x: this.radius,
            y: this.radius
        };
        // create the SVG drawing context
        this.draw = SVG(view.id).size(width, height).viewbox(0, 0, width, height);
        // draw the default circle and line
        this.circle = this.drawCircle().click(this.onClick.bind(this));
        this.drawLine({
            x: 0,
            y: this.radius
        });
    },
    /**
     * Draws a circle in the default position.
     */
    drawCircle: function () {
        return this.draw.circle(this.radius * 2).attr({
            fill: '#ddd'
        }).move(-10, 10);
    },
    /**
     * Draws a line in the default position of the circle.
     *
     * @param endpoint The endpoint to draw the line at. This is an object that contains an x and y coordinate.
     */
    drawLine: function (endpoint) {
        this.draw.path(Ext.String.format('M {0},{1} L {2},{3}', this.centre.x, this.centre.y, endpoint.x + this.centre.x, -endpoint.y + this.centre.y)).stroke({
            color: '#555',
            width: 2
        });
    },
    onClick: function (event) {
        var bound = this.circle.node.getBoundingClientRect();
        var x = event.x - bound.left - this.centre.x;
        var y = -(event.y - bound.top - this.centre.y);
        console.log("(x, y) = " + x + ", " + y);
        var length = Math.sqrt(x * x + y * y);              // calculate the length of the vector
        var unit = {                                        // calculate the unit vector
            x: x / length,
            y: y / length
        };
        //var angle = Math.atan2(unit.y, unit.x);
        debugger;
        this.drawLine({
            x: unit.x * this.radius,
            y: unit.y * this.radius
        });

    }
});
