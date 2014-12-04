Ext.define('NU.view.factory.angle.AngleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Angle',
    draw: null,                     // the SVG drawing context
    centre: null,                   // the centre of the circle
    radius: null,                   // the radius of the circle
    defaultLine: null,              // the line pointing up in the circle
    line: null,                     // the line that is drawn via an event
    fill: null,                     // the fill colour denoting how large the angle is
    widget: null,                   // the widget group containing the circle and lines
    /**
     * An event fired when the Angle view has finished rendering.
     *
     * @param container The view that is rendered.
     */
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
        this.centre =  vec2.fromValues(this.radius, this.radius);
        // create the SVG drawing context
        this.draw = SVG(view.id).size(width, height).viewbox(0, 0, width, height);
        // create the drawing group
        this.widget = this.draw.group();
        // draw the default and fill circle and attach the click events to both
        this.drawCircle('#ddd', 1).click(this.onClick.bind(this));
        this.fill = this.drawCircle('#3ebdd6', 0.5).click(this.onClick.bind(this));
        // set the default coordinates of the line
        var coordinates = vec2.fromValues(0, this.radius);
        // draw the default line
        this.defaultLine = {
            line: this.drawLine(coordinates),
            coordinates: coordinates
        };
        // update the fill circle
        this.updateFillCircle();
    },
    /**
     * Draws a circle in the default position.
     *
     * @param color The colour of the circle.
     * @param opacity The opacity of the circle.
     */
    drawCircle: function (color, opacity) {
        // create the circle with its diameter and specified colour and opacity
        var circle = this.draw.circle(this.radius * 2).fill({
            color: color,
            opacity: opacity
        });
        this.widget.add(circle);    // add the circle to the group
        return circle;              // return the circle
    },
    /**
     * Draws a line in the default position of the circle.
     *
     * @param endpoint The endpoint to draw the line at. This is an object that contains an x and y coordinate.
     */
    drawLine: function (endpoint) {
        // create the line by calculating its path and adding a stroke to it
        var line = this.draw.path(this.calculateLinePath(endpoint)).stroke({
            color: '#555',
            width: 2
        });
        this.widget.add(line);      // add the line to the group
        return line;                // return the line
    },
    /**
     * Converts the endpoint into a usable coordinate. The endpoint is based off a cartesian coordinate system where
     * the origin is located at point (0, 0). It is converted into the local position of the circle by applying the
     * offset of the centre of the circle.
     *
     * @param endpoint The endpoint of the line that lies on the circle and touches its border.
     * @returns {vec2} The new vec2 coordinates.
     */
    calculateCoordinates: function (endpoint) {
        return vec2.fromValues(endpoint[0] + this.centre[0], -endpoint[1] + this.centre[1]);
    },
    /**
     * Calculates the path of the line given an endpoint. The path begins from the centre of the circle and extends to
     * the endpoint.
     *
     * @param endpoint The final point on the line.
     * @returns {*} The line path for the SVG.
     */
    calculateLinePath: function (endpoint) {
        var coordinates = this.calculateCoordinates(endpoint);
        return Ext.String.format('M {0},{1} L {2},{3}', this.centre[0], this.centre[1], coordinates[0], coordinates[1]);
    },
    /**
     * Updates the fill circle display by calculating the appropriate mask polygon.
     *
     * @param endpoint The final point on the line within the circle.
     */
    updateFillCircle: function (endpoint) {
        // check if a line exists
        if (this.line === null) {
            // hide the fill completely
            this.fill.maskWith(this.fill.clone());
        } else {
            // remove the current fill mask
            this.fill.unmask();
            // determine the quadrant using the endpoint
            var quadrant = this.calculateQuadrant(endpoint);
            // calculate the actual coordinates of the line
            var defaultLineCoordinates = this.calculateCoordinates(this.defaultLine.coordinates);
            // calculate the actual coordinates of the endpoint
            var coordinates = this.calculateCoordinates(endpoint);
            // calculate the diameter of the circle
            var diameter = this.radius * 2;
            // create the mask for the fill
            var mask = this.draw.polygon(Ext.String.format('{0},{1} {2},{3} {4},{5} {6},{7} {8},{9} {10},{11} {12},{13}',

                defaultLineCoordinates[0], defaultLineCoordinates[1],           // top centre
                this.centre[0], this.centre[1],                                 // centre
                coordinates[0], coordinates[1],                                 // endpoint coordinates
                quadrant === 4 ? -diameter : coordinates[0], coordinates[1],    // move left if in quadrant 4 before going down
                quadrant === 4 ? -diameter : coordinates[0],
                quadrant === 1 ? coordinates[1] : diameter,                     // move down unless in quadrant 1
                diameter, quadrant === 1 ? coordinates[1] : diameter,           // move right and up unless in quadrant 1
                diameter, -diameter                                             // move up from bottom right

            )).fill({                                                           // apply a fill colour to the mask
                color: '#fff'
            });
            this.fill.maskWith(mask);                                           // apply the mask to the fill
        }
    },
    /**
     * Calculates the quadrant that the vector lies in.
     *
     * @param vector The vector being checked against.
     * @returns {number} The quadrant.
     */
    calculateQuadrant: function (vector) {
        return vector[0] > 0 ? (vector[1] > 0 ? 1 : 2) : (vector[1] < 0 ? 3 : 4);
    },
    /**
     * Calculates the angle between two vectors.
     *
     * @param u The first vector. This is typically the vector created by the user.
     * @param v The second vector. This is typically the coordinates of the default line.
     * @returns {number} The angle between u and v in degrees.
     */
    calculateAngle: function (u, v) {
        // calculate the angle using the dot product
        var angle = Math.acos(vec2.dot(vec2.normalize(vec2.create(), u), vec2.normalize(vec2.create(), v)));
        // calculate the quadrant of the first vector
        var quadrant = this.calculateQuadrant(u);
        if (quadrant === 3 || quadrant === 4) {                 // check if the quadrant lies on the left
            angle = 2 * Math.PI - angle;                        // make the angle reflexive
        }
        return angle * 180 / Math.PI;                           // return the angle in degrees
    },
    /**
     * An event fired when the circle is clicked on. It updates where the line sits and the fill display. The calculated
     * x and y values ensure that the origin is at the centre of the circle.
     *
     * @param event The mouse click event.
     */
    onClick: function (event) {
        var bound = this.widget.node.getBoundingClientRect();   // get the absolute coordinates of the widget
        var vector = vec2.fromValues(
            event.x - bound.left - this.centre[0],              // calculate the local x value
            -(event.y - bound.top - this.centre[1])             // calculate the local y value and ensure that positive y is up
        );
        var u = vec2.normalize(vec2.create(), vector);          // calculate the unit vector of where the user clicked
        // calculate the endpoint to draw the line at
        var endpoint = vec2.fromValues(u[0] * this.radius, u[1] * this.radius);
        // calculate the new angle
        var angle = this.calculateAngle(vector, this.defaultLine.coordinates);
        console.log(angle);
        // check if the line exists
        if (this.line === null) {
            this.line = this.drawLine(endpoint);                // create the path if it does not exist
        } else {
            this.line.plot(this.calculateLinePath(endpoint));   // update the line path instead of creating a new one
        }
        this.updateFillCircle(endpoint);                        // update the fill circle
    }
});
