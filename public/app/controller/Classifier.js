 Ext.define('NU.controller.Classifier', {
    extend: 'NU.controller.Display',
    config: {
        rawContext: null,
        classifiedContext: null,
        frozen: false,
        lookup: null,
        lookupBackwardHistory: null,
        lookupForwardHistory: null,
        lookupHistoryLength: 10,
        previewLookup: null,
        overwrite: false,
        selectionTool: 'magic_wand',
        polygonPoints: null,
        rawImageData: null,
        classifiedImageData: null,
        mouseX: 0,
        mouseY: 0,
        imageWidth: 320,
        imageHeight: 240,
        leftMouseDown: false,
        range: 10,
        tolerance: 5,
        renderZoom: true,
        renderRawUnderlay: true,
        rawUnderlayOpacity: 0.5,
        magicWandPoints: null,
        target: 'Field'
    },
    statics: {
        Target: {
            'Unclassified': 0,
            'Goal': 1,
            'Field': 2,
            'Ball': 3,
            'Line': 4
        },
        Tool: {
            'Point': 0,
            'MagicWand': 1,
            'Polygon': 2
        }
    },
    control: {
        'rawImage': true,
        'classifiedImage': true,
        'undo': {
            click: function () {
                this.undoHistory();
            }
        },
        'redo': {
            click: function () {
                this.redoHistory();
            }
        },
        'toolPoint': {
            click: function () {
                this.setSelectionTool('point');
            }
        },
        'toolMagicWand': {
            toggle: function (btn, pressed) {
                if (pressed) {
                    this.setSelectionTool('magic_wand');
                } else {
                    this.setMagicWandPoints([]);
                    this.renderImages();
                }
            }
        },
        'toolPolygon': {
            toggle: function (btn, pressed) {
                if (pressed) {
                    this.setSelectionTool('polygon');
                } else {
                    this.setPolygonPoints([]);
                    this.renderImages();
                }
            }
        },
        'toolZoom': {
            toggle: function (btn, pressed) {
                this.setRenderZoom(pressed);
                this.renderImages();
            }
        },
        'targetGreen': {
            click: function () {
                this.setTarget('Field');
            }
        },
        'targetYellow': {
            click: function () {
                this.setTarget('Goal');
            }
        },
        'targetWhite': {
            click: function () {
                this.setTarget('Line');
            }
        },
        'targetBlack': {
            click: function () {
                this.setTarget('Unclassified');
            }
        },
        'targetOrange': {
            click: function () {
                this.setTarget('Ball');
            }
        },
        'reset': {
            click: function () {
                this.addHistory();
                this.setLookup({});
                this.setClassifiedImageData(this.generateClassifiedData());
                this.renderClassifiedImage();
            }
        },
        'snapshot': {
            change: function (checkbox, newValue, oldValue, eOpts) {
                this.setFrozen(newValue);
            }
        },
        'toolOverwrite': {
            toggle: function (btn, pressed) {
                this.setOverwrite(pressed);
            }
        },
        'toleranceValue': {
            change: function (checkbox, newValue, oldValue, eOpts) {
                this.setTolerance(newValue);
            }
        },
        'rawUnderlay': {
            change: function (checkbox, newValue, oldValue, eOpts) {
                this.setRenderRawUnderlay(newValue);
                this.renderClassifiedImage();
            }
        },
        'rawUnderlayOpacity': {
            change: function (checkbox, newValue, oldValue, eOpts) {
                if (checkbox.isValid()) {
                    this.setRawUnderlayOpacity(newValue);
                    this.renderClassifiedImage();
                }
            }
        },
        'rawValue': true,
        'classifiedValue': true
    },
    init: function () {
        // these must initialized here so there is an object per-controller
        this.setLookup({});
        this.setLookupForwardHistory([]);
        this.setLookupBackwardHistory([]);
        this.setPreviewLookup({});
        this.setPolygonPoints([]);
        this.setMagicWandPoints([]);

        NU.util.Network.on('vision', Ext.bind(this.onVision, this));
        this.callParent(arguments);

        var rawElCanvas = this.getRawImage().getEl();
        var rawCanvas = rawElCanvas.dom;
        this.setRawContext(rawCanvas.getContext('2d'));

        var classifiedElCanvas = this.getClassifiedImage().getEl();
        var classifiedCanvas = classifiedElCanvas.dom;
        var ctx = classifiedCanvas.getContext('2d');
        this.setClassifiedContext(ctx);
        this.setClassifiedImageData(ctx.getImageData(0, 0, 320, 240));

        function clickBind(callback, preventDefault) {
            return function (e, element) {
                if (preventDefault === undefined || preventDefault) {
                    e.preventDefault();
                }

                var el = Ext.get(element);
                var x = e.getX() - el.getLeft();
                var y = e.getY() - el.getTop();

                callback.call(this, x, y, e);
            };
        }

        [rawElCanvas, classifiedElCanvas].forEach(function (element) {
            this.mon(element, {
                click: clickBind(this.onImageClick),
                dblclick: clickBind(this.onImageDblClick),
                contextmenu: clickBind(this.onImageRightClick),
                mousemove: clickBind(this.onImageMouseMove),
                mousedown: function (e) {
                    e.preventDefault();
                    if (e.button === 0) {
                        this.setLeftMouseDown(true);
                        switch (this.getSelectionTool()) {
                            case 'point':
                                this.addHistory();
                                break;
                        }
                    }
                },
                mouseup: function (e) {
                    e.preventDefault();
                    if (e.button === 0) {
                        this.setLeftMouseDown(false);
                    }
                },
                scope: this
            });
        }, this);

        this.testDrawImage();
    },
    addHistory: function () {
        var backwardHistory = this.getLookupBackwardHistory();
        var lookup = Ext.clone(this.getLookup());
        backwardHistory.push(lookup);
        this.setLookupForwardHistory([]);
    },
    undoHistory: function () {
        var backwardHistory = this.getLookupBackwardHistory();
        var forwardHistory = this.getLookupForwardHistory();
        if (backwardHistory.length > 0) {
            forwardHistory.push(this.getLookup());
            this.setLookup(backwardHistory.pop());
            this.setClassifiedImageData(this.generateClassifiedData());
            this.renderClassifiedImage();
            if (forwardHistory.length > this.getLookupHistoryLength()) {
                forwardHistory.shift();
            }
        }
    },
    redoHistory: function () {
        var backwardHistory = this.getLookupBackwardHistory();
        var forwardHistory = this.getLookupForwardHistory();
        if (forwardHistory.length > 0) {
            backwardHistory.push(this.getLookup());
            this.setLookup(forwardHistory.pop());
            this.setClassifiedImageData(this.generateClassifiedData());
            this.renderClassifiedImage();
            if (backwardHistory.length > this.getLookupHistoryLength()) {
                backwardHistory.shift();
            }
        }
    },
    onVision: function (robotIP, api_message) {

        // TODO: remove
        if (robotIP !== this.robotIP) {
            return;
        }

        var api_vision = api_message.vision;
        var image = api_vision.image;

        if (!this.getFrozen()) {
            this.drawImage(image);
        }

    },
    onImageMouseMove: function (x, y, e) {
        this.setMouseX(x);
        this.setMouseY(y);
        this.renderRawImage();
        this.renderClassifiedImage();

        if (this.getLeftMouseDown()) {
            switch (this.getSelectionTool()) {
                case 'point':
                    this.classifyPoint(x, y);
                    break;
            }
        }

        var rgba = this.getPointRGBA(x, y, this.getRawImageData().data);
        this.getRawValue().update("(" + x + ", " + y + ") = rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")");

        var rgba = this.getPointRGBA(x, y, this.getClassifiedImageData().data);
        this.getClassifiedValue().update("(" + x + ", " + y + ") = rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")");
    },
    onImageClick: function (x, y) {
        switch (this.getSelectionTool()) {
            case 'point':
                this.addHistory();
                this.classifyPoint(x, y);
                break;
            case 'magic_wand':
                this.magicWandSelect(x, y);
                break;
            case 'polygon':
                this.polygonAddPoint(x, y);
                break;
        }
    },
    onImageDblClick: function (x, y) {
        switch (this.getSelectionTool()) {
            case 'point':
            case 'magic_wand':
                this.onImageClick(x, y);
                break;
            case 'polygon':
                this.addHistory();
                this.classifyPolygon();
                break;
        }
    },
    onImageRightClick: function (x, y) {
        switch (this.getSelectionTool()) {
            case 'point':
                // temporarily turn override on and restore after
                var overwrite = this.getOverwrite();
                this.setOverwrite(true);
                this.addHistory();
                this.classifyPoint(x, y, 'Unclassified');
                this.setOverwrite(overwrite);
                break;
            case 'magic_wand':
                this.addHistory();
                this.magicWandClassify(x, y);
                break;
            case 'polygon':
                this.polygonRemovePoint(x, y);
                break;
        }
    },
    polygonAddPoint: function (x, y) {
        var points = this.getPolygonPoints();
        points.push([x, y]);
        this.renderImages();
    },
    polygonRemovePoint: function (x, y) {
        var points = this.getPolygonPoints();
        if (points.length > 0) {
            points.pop();
            this.renderImages();
        }
    },
    magicWandSelect: function (x, y, tolerance) {
        var points = [];
        var queue = [];
        var checked = {};
        queue.push([x, y]);
        if (tolerance === undefined) {
            tolerance = this.getTolerance();
        }
        while (queue.length > 0) {
            var point = queue.shift();
            for (var dy = -1; dy <= 1; dy++) {
                for (var dx = -1; dx <= 1; dx++) {
                    var neighbourX = point[0] + dx;
                    var neighbourY = point[1] + dy;

                    if ((dy === 0 && dx === 0) || neighbourX < 0 || neighbourX > 320 || neighbourY < 0 || neighbourY > 240) {
                        break;
                    }
                    var rgba = this.getPointRGBA(point[0], point[1]);
                    var ycbcr = this.getYCBCRfromRGB(rgba[0], rgba[1], rgba[2]);
                    var neighbourRgba = this.getPointRGBA(neighbourX, neighbourY);
                    var neighbourYcbcr = this.getYCBCRfromRGB(neighbourRgba[0], neighbourRgba[1], neighbourRgba[2]);
                    var abs = Math.sqrt(ycbcr[0] * ycbcr[0] + ycbcr[1] * ycbcr[1] + ycbcr[2] * ycbcr[2]);
                    var neighbourAbs = Math.sqrt(neighbourYcbcr[0] * neighbourYcbcr[0] + neighbourYcbcr[1] * neighbourYcbcr[1] + neighbourYcbcr[2] * neighbourYcbcr[2]);
                    var dist = Math.abs(abs - neighbourAbs);
                    var newPoint = [neighbourX, neighbourY];
                    var hash = this.hashPoint(newPoint);
                    if (dist <= tolerance && checked[hash] === undefined) {
                        queue.push(newPoint);
                        points.push(newPoint);
                    }
                    checked[hash] = true;
                }
            }
        }
        this.setMagicWandPoints(points);
    },
    hashPoint: function (point) {
        return point[0] + "," + point[1];
    },
    magicWandClassify: function (x, y) {
        var points = this.getMagicWandPoints();
        points.forEach(function (point) {
            this.classifyPoint(point[0], point[1], undefined, false, 5);
        }, this);
        this.updateClassifiedData();
        this.renderClassifiedImage();
        this.setMagicWandPoints([]);
    },
    classifyPolygon: function () {
        var points = this.getPolygonPoints();
        // complete polygon
        if (points.length === 0) {
            return;
        }
        points[points.length] = points[0];
        var boundingBox = this.findBoundingBox(points);
        var start = boundingBox[0];
        var end = boundingBox[1];

        for (var x = start[0]; x < end[0]; x++) {
            for (var y = start[1]; y < end[1]; y++) {
                if (this.isPointInPolygon(x, y, points, boundingBox)) {
                    this.classifyPoint(x, y, undefined, false);
                }
            }
        }
        this.updateClassifiedData();
        this.renderClassifiedImage();
        this.setPolygonPoints([]);
    },
    isPointInPolygon: function (x, y, points, boundingBox) {
        if (boundingBox === undefined) {
            boundingBox = this.findBoundingBox(points);
        }
        var start = boundingBox[0];
        var end = boundingBox[1];
        if (x < start[0] || x > end[0] || y < start[1] || y > end[1]) {
            // point is not in the bounding box, definitely not in the polygon
            return false;
        }

        // uses the ray casting method
        // ported from http://geomalgorithms.com/a03-_inclusion.html
        var cn = 0; // the crossing number counter
        // loop through all edges of the polygon
        for (var i = 0; i < points.length - 1; i++) {
            // an upward crossing
            if (
                ((points[i][1] <= y) && (points[i+1][1] > y))
                || ((points[i][1] > y) && (points[i+1][1] <= y)) // a downward crossing
                ) {
                // compute the actual edge-ray intersect x-coordinate
                var vt = (y  - points[i][1]) / (points[i+1][1] - points[i][1]);
                // P.x < intersect
                if (x <  points[i][0] + vt * (points[i+1][0] - points[i][0])) {
                    // a valid crossing of y = P.y right of P.x
                    cn++;
                }
            }
        }
        return (cn & 1); // 0 if even (out), and 1 if  odd (in)
    },
    findBoundingBox: function (points) {
        var minX = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        points.forEach(function (point) {
            var x = point[0];
            var y = point[1];

            if (x < minX) {
                minX = x;
            }
            if (x > maxX) {
                maxX = x;
            }
            if (y < minY) {
                minY = y;
            }
            if (y > maxY) {
                maxY = y;
            }
        });

        return [
            [minX, minY],
            [maxX, maxY]
        ];
    },
    classifyPoint: function (x, y, target, doRender, range) {
        var rgba = this.getPointRGBA(x, y);
        var ycbcr = this.getYCBCRfromRGB(rgba[0], rgba[1], rgba[2]);
        if (target === undefined) {
            target = this.getTarget();
        }
        this.addLookupColour(ycbcr, target, range);
        if (doRender === undefined || doRender) {
            this.updateClassifiedData();
            this.renderClassifiedImage();
            this.renderPolygonOverlays();
        }
    },
    getPointRGBA: function (x, y, data) {
        var offset = 4 * y * 320 + 4 * x;
        if (data === undefined) {
            data = this.getRawImageData().data;
        }
        return data.slice(offset, offset + 4);
    },
    addLookupColour: function (ycbcr, type, range) {
        var lookup = this.getLookup();
        if (range === undefined) {
            range = this.getRange();
        }
        for (var y = 0; y < range; y++) {
            for (var cb = 0; cb < range; cb++) {
                for (var cr = 0; cr < range; cr++) {
                    var nearYcbcr = [
                        ycbcr[0] + y,
                        ycbcr[1] + cb,
                        ycbcr[2] + cr,
                    ];
                    var hash = this.hash(nearYcbcr);
                    var typeId = this.self.Target[type];
                    if (this.getOverwrite() || lookup[hash] === undefined) {
                        if (typeId === this.self.Target.Unclassified) {
                            delete lookup[hash];
                        } else {
                            lookup[hash] = typeId;
                        }
                    }
                }
            }
        }
//        var hash = this.hash(ycbcr);
//        var typeId = this.self.Target[type];
//        lookup[hash] = typeId;
    },
    getYCBCRfromRGB: function (r, g, b) {
        var ycc = [];
        ycc[0] = Math.floor(      0.299    * r + 0.587    * g + 0.114    * b);
        ycc[1] = Math.floor(128 - 0.168736 * r - 0.331264 * g + 0.5      * b);
        ycc[2] = Math.floor(128 + 0.5      * r - 0.418688 * g + 0.081312 * b);
        return ycc;
    },
    hash: function (ycc) {
        return ycc[0] + '.' + ycc[1] + '.' + ycc[2];
    },
    renderImages: function () {
        this.renderRawImage();
        this.renderClassifiedImage();
    },
    renderRawImage: function () {
        var ctx = this.getRawContext();
        ctx.putImageData(this.getRawImageData(), 0, 0);
        this.renderPolygonOverlay(ctx);
        this.renderMagicWandOverlay(ctx);
        if (this.getRenderZoom()) {
            this.renderZoomOverlay(ctx, this.getRawImageData());
        }
    },
    renderClassifiedImage: function () {
        var ctx = this.getClassifiedContext();
        ctx.putImageData(this.getClassifiedImageData(), 0, 0);
        if (this.getRenderRawUnderlay()) {
            this.renderImageUnderlay(ctx, this.getRawImageData());
        }
        this.renderPolygonOverlay(ctx);
        this.renderMagicWandOverlay(ctx);
        if (this.getRenderZoom()) {
            this.renderZoomOverlay(ctx, this.getClassifiedImageData());
        }
    },
    renderImageUnderlay: function (ctx, rawImageData) {
        var data = ctx.getImageData(0, 0, 320, 240);
        var rawData = rawImageData.data;
        var rawOpacity = this.getRawUnderlayOpacity();
        var classifiedOpacity = 1 - this.getRawUnderlayOpacity();
        for (var y = 0; y < 240; y++) {
            for (var x = 0; x < 320; x++) {
                var offset = 4 * 320 * y + 4 * x;
                data.data[offset] = Math.round(data.data[offset] * classifiedOpacity + rawData[offset] * rawOpacity);
                data.data[offset + 1] = Math.round(data.data[offset + 1] * classifiedOpacity + rawData[offset + 1] * rawOpacity);
                data.data[offset + 2] = Math.round(data.data[offset + 2] * classifiedOpacity + rawData[offset + 2] * rawOpacity);
                data.data[offset + 3] = 255;
            }
        }
        ctx.putImageData(data, 0, 0);
    },
    renderPolygonOverlays: function () {
        this.renderPolygonOverlay(this.getClassifiedContext());
        this.renderPolygonOverlay(this.getRawContext());
    },
    renderPolygonOverlay: function (ctx) {
        var points = this.getPolygonPoints();
        if (points.length > 0) {
            var firstPoint = points[0];
            ctx.strokeStyle = '#fff';
            //ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.moveTo(firstPoint[0], firstPoint[1]);
            points.forEach(function (point) {
                ctx.lineTo(point[0], point[1]);
            });
            ctx.lineTo(this.getMouseX(), this.getMouseY());
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    },
    renderMagicWandOverlay: function (ctx) {
        var data = ctx.getImageData(0, 0, 320, 240);
        var points = this.getMagicWandPoints();
        points.forEach(function (point) {
            var x = point[0];
            var y = point[1];

            var offset = 4 * 320 * y + 4 * x;
            data.data[offset] = 255;
            data.data[offset + 1] = 0;
            data.data[offset + 2] = 0;
            data.data[offset + 3] = 255;
        }, this);
        ctx.putImageData(data, 0, 0);
    },
    renderZoomOverlay: function (ctx, imageData) {
        var data = ctx.getImageData(0, 0, 320, 240);
        var originalData = imageData.data;
        var mouseX = this.getMouseX();
        var mouseY = this.getMouseY();
        var zoom = 3; // must be an odd integer
        var width = zoom * 43; // should be divisible by zoom and odd
        var height = zoom * 21; // should be divisible by zoom and odd
        var minX = 0;
        var minY = 0;
        var maxX = 320;
        var maxY = 240;
        var pxSize = 4;

        var row = -Math.floor(height / 2 / zoom);
        var col = -Math.floor(width / 2 / zoom);
        var zoomDiff = Math.floor(zoom / 2);
        // loop though pixels of zoomed image
        for (var y = maxY - height + zoomDiff; y < maxY - zoomDiff; y += zoom) {
            for (var x = maxX - width + zoomDiff; x < maxX - zoomDiff; x += zoom) {
                // calculate the real coordinates
                var realX = mouseX + col;
                var realY = mouseY + row;
                var realOffset = pxSize * maxX * realY + pxSize * realX;

                for (var zy = -zoomDiff; zy <= zoomDiff; zy++) {
                    for (var zx = -zoomDiff; zx <= zoomDiff; zx++) {
                        var zoomX = x + zx;
                        var zoomY = y + zy;
                        var zoomOffset = pxSize * maxX * zoomY + pxSize * zoomX;
                        if (realX < minX || realX >= maxX || realY < minY || realY >= maxY) {
                            data.data[zoomOffset] = 0;
                            data.data[zoomOffset + 1] = 0;
                            data.data[zoomOffset + 2] = 0;
                            data.data[zoomOffset + 3] = 255;
                        } else {
                            data.data[zoomOffset] = originalData[realOffset];
                            data.data[zoomOffset + 1] = originalData[realOffset + 1];
                            data.data[zoomOffset + 2] = originalData[realOffset + 2];
                            data.data[zoomOffset + 3] = originalData[realOffset + 3];
                        }
                    }
                }

                col++;
            }
            row++;
            col = -Math.floor(width / 2 / zoom);
        }
        // draw border
        var borderOpacity = 0.5;
        for (var y = maxY - height - 1; y < maxY; y++) {
            for (var x = maxX - width - 1; x < maxX; x++) {
                if (y === maxY - height - 1 || x === maxX - width - 1) {
                    var offset = pxSize * maxX * y + pxSize * x;
                    data.data[offset] = Math.round(data.data[offset] * (1 - borderOpacity) + 255 * borderOpacity);
                    data.data[offset + 1] = Math.round(data.data[offset + 1] * (1 - borderOpacity) + 255 * borderOpacity);
                    data.data[offset + 2] = Math.round(data.data[offset + 2] * (1 - borderOpacity) + 255 * borderOpacity);
                    data.data[offset + 3] = 255;
                }
            }
        }
        // draw crosshair
        var zoomCenterY = maxY - Math.floor(height / 2) - 1;
        var zoomCenterX = maxX - Math.floor(width / 2) - 1;
        for (var zy = -1; zy <= 1; zy++) {
            for (var zx = -1; zx <= 1; zx++) {
                if (zy !== 0 && zx !== 0) {
                    continue;
                }
                var offset = 4 * maxX * (zoomCenterY + zy) + 4 * (zoomCenterX + zx);
                data.data[offset] = 255;
                data.data[offset + 1] = 255;
                data.data[offset + 2] = 255;
                data.data[offset + 3] = 255;
            }
        }
        ctx.putImageData(data, 0, 0);
//        var x = maxX - Math.round(Math.floor(width / 2));
//        var y = maxY - Math.round(Math.floor(height / 2));
//        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
//
//        ctx.moveTo(x - 1, y);
//        ctx.lineTo(x + 2, y);
//        ctx.stroke();
//
//        ctx.moveTo(x, y - 1);
//        ctx.lineTo(x, y + 2);
//        ctx.stroke();
    },
    updateClassifiedData: function () {
        this.setClassifiedImageData(this.generateClassifiedData());
    },
    generateClassifiedData: function () {
        var rawData = this.getRawImageData();

        var classifiedCtx = this.getClassifiedContext();
        var classifiedData = classifiedCtx.createImageData(320, 240);

        var lookup = this.getLookup();
        for (var row = 0; row < 240; row++) {
            for (var col = 0; col < 320; col++) {
                var index = 4 * row * 320 + 4 * col;
                var ycc = this.getYCBCRfromRGB(rawData.data[index], rawData.data[index + 1], rawData.data[index + 2]);
                var hash = this.hash(ycc);
                if (lookup[hash] !== undefined) {
                    var rgb = this.getRGBfromType(lookup[hash]);
                    classifiedData.data[index + 0] = rgb[0];
                    classifiedData.data[index + 1] = rgb[1];
                    classifiedData.data[index + 2] = rgb[2];
                    classifiedData.data[index + 3] = 255;
                } else {
                    classifiedData.data[index + 0] = 0;
                    classifiedData.data[index + 1] = 0;
                    classifiedData.data[index + 2] = 0;
                    classifiedData.data[index + 3] = 255;
                }
            }
        }
        return classifiedData;
    },
    getRGBfromType: function (typeId) {
        var Target = this.self.Target;
        switch (typeId) {
            case Target.Unclassified:
                return [0, 0, 0];
            case Target.Line:
                return [255, 255, 255];
            case Target.Ball:
                return [255, 144, 0];
            case Target.Field:
                return [0, 255, 0];
            case Target.Goal:
                return [255, 255, 0];
            default:
                return [0, 0, 0];
        }
    },
    drawImage: function (image) {
        this.drawImageB64(image);
    },
    drawImageB64: function (image) {
        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
        var uri = 'data:image/jpeg;base64,' + btoa(data);
        var imageObj = new Image();
        var ctx = this.getRawContext();
        imageObj.src = uri;
        imageObj.onload = function () {
            ctx.drawImage(imageObj, 0, 0, image.width, image.height);
        };
    },
    testDrawImage: function () {
        var uri = 'data:image/jpeg;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
        var imageObj = new Image();
        var ctx = this.getRawContext();
        var me = this;
        imageObj.src = uri;
        imageObj.onload = function () {
            ctx.drawImage(imageObj, 0, 0, 320, 240);
            me.setRawImageData(ctx.getImageData(0, 0, 320, 240));
            me.renderImages();
        };
    }
});