Ext.define('NU.view.factory.angle.AngleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Angle',
    radius: null,
    angle: null,
    onAfterRender: function (container) {
        container.mon(container.getEl(), 'click', this.onClick, this);
        this.renderComponents(container);
    },
    renderComponents: function (view) {
        // get the dimensions from the view
        var dimensions = view.getDimensions();
        var width =  dimensions.width;
        var height = dimensions.height;
        // create the SVG drawing context
        var draw = SVG(view.id).size(width, height).viewbox(0, 0, width, height);
        // create the circle
        draw.circle(width).attr({
            fill: '#ddd'
        });
        this.radius = width * 0.5;
        // create the line
        this.angle = {
            x: this.radius,  // || value
            y: -this.radius, // || value
            centre: {
                x: this.radius,
                y: this.radius
            },
            line: draw.rect(2, this.radius).attr({
                fill: '#555'
            }).translate(this.radius)
        }
    },
    onClick: function (event) {
        debugger;
        var view = this.getView();
        var centre = this.angle.centre;
        var x = event.getX() - view.getX() - centre.x;
        var y = event.getY() - view.getY() - centre.y;
        var length = Math.sqrt(x * x + y * y);
        x /= length; // = unit
        y /= length; // = unit
        var angle = Math.atan2(y, x);
        var end = {
            x: x * this.radius,
            y: y * this.radius
        }
    }
});
