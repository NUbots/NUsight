Ext.define('NU.view.window.Classifier', {
	extend : 'NU.view.window.Display',
	requires: [
		'NU.view.plot.Scatter3D',
		'NU.view.LayeredCanvas',
		'Ext.form.field.Checkbox'
	],
	alias : ['widget.nu_classifier_window'],
	controller: 'NU.controller.Classifier',
	title: 'Classifier',
	width: 800,
	height: 780,
	layout: {
		type: 'vbox',
		align: 'stretch',
		flex: 1
	},
	initComponent: function () {
		Ext.apply(this, {
			tbar: [{
				xtype: 'robot_selector'
			}, '->', {
				text: 'Undo',
				itemId: 'undo'
			}, {
				text: 'Redo',
				itemId: 'redo'
			}, {
				text: 'Reset',
				itemId: 'reset'
			}, {
				text: 'Download',
				itemId: 'download'
			}, {
				text: 'Upload',
				itemId: 'upload'
			}, {
				text: 'Upload & Save',
				itemId: 'uploadSave'
			}, {
				text: 'Refresh',
				itemId: 'refresh'
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'left',
				items: [{
					itemId: 'toolPoint',
					iconCls: 'icon-pencil',
					toggleGroup: 'tool',
					allowDepress: false,
					tooltip: 'Point Tool - Classify the point clicked on +/- the range (right click to unclassify the point)'
				}, {
					itemId: 'toolMagicWand',
					iconCls: 'icon-wand',
					toggleGroup: 'tool',
					pressed: true,
					allowDepress: false,
					tooltip: 'Magic Wand Tool - Select the point clicked and similar surrounding pixels using tolerance (right click to classify, ctrl+click to quickly classify without selecting)'
				}, {
					itemId: 'toolRectangle',
					iconCls: 'icon-shape-square',
					toggleGroup: 'tool',
					allowDepress: false,
					tooltip: 'Rectangle Tool - Draw a rectangle with two points, second click will apply (right click to remove last point)'
				}, {
					itemId: 'toolEllipse',
					iconCls: 'icon-toolbar-ellipse',
					toggleGroup: 'tool',
					allowDepress: false,
					tooltip: 'Ellipse Tool - Draw an ellipse with two points, second click will apply (right click to remove last point)'
				}, {
					itemId: 'toolPolygon',
					iconCls: 'icon-toolbar-polygon',
					toggleGroup: 'tool',
					allowDepress: false,
					tooltip: 'Polygon Tool - Draw a polygon with a set of points, double click to apply (right click to remove last point)'
				}, '-', {
					itemId: 'toolZoom',
					iconCls: 'icon-toolbar-zoom',
					enableToggle: true,
					pressed: false,
					tooltip: 'Enables a zoom overlay'
				}, {
					itemId: 'toolOverwrite',
					iconCls: 'icon-page-white-paint',
					enableToggle: true,
					tooltip: 'Enables the overwriting of already classified colours (needed for unclassifying)'
				}, '-', {
					itemId: 'targetGreen',
					iconCls: 'icon-toolbar-green',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Field',
					pressed: true
				}, {
					itemId: 'targetOrange',
					iconCls: 'icon-toolbar-orange',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Ball'
				}, {
					itemId: 'targetYellow',
					iconCls: 'icon-toolbar-yellow',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Goal'
				}, {
					itemId: 'targetCyan',
					iconCls: 'icon-toolbar-cyan',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Cyan'
				}, {
					itemId: 'targetMagenta',
					iconCls: 'icon-toolbar-magenta',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Magenta'
				}, {
					itemId: 'targetWhite',
					iconCls: 'icon-toolbar-white',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Line'
				}, {
					itemId: 'targetBlack',
					iconCls: 'icon-toolbar-black',
					toggleGroup: 'target',
					allowDepress: false,
					tooltip: 'Unclassified'
				}]
			}],
			items: [{
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				flex: 1,
				items: [{
					// images
					layout: {
						type: 'hbox',
						align: 'stretch'
					},
					flex: 1,
					items: [{
						// camera
						layout: {
							type: 'vbox',
							align: 'stretch'
						},
						flex: 1,
						items: [{
							// raw image
							layout: 'fit',
							flex: 1,
							style: {
								display: 'block',
								border: '2px solid #000',
								borderRadius: '2px',
								marginBottom: '3px'
							},
							items: {
								xtype: 'nu_layered_canvas',
								itemId: 'rawImage',
								width: 320,
								height: 240,
								style: {
									backgroundColor: '#000',
									cursor: 'crosshair'
//								backgroundImage: "url('resources/images/camera.png')",
//								backgroundRepeat: 'no-repeat',
//								backgroundPosition: 'center',
								}
							}
						}, {
							// classified
							layout: 'fit',
							flex: 1,
							style: {
								display: 'block',
								border: '2px solid #000',
								borderRadius: '2px'
							},
							items: {
								xtype: 'nu_layered_canvas',
								itemId: 'classifiedImage',
								width: 320,
								height: 240,
								style: {
									backgroundColor: '#000',
									cursor: 'crosshair'
								}
							}
						}]
					}, {
						// 3d scatter
						xtype: 'scatter3d',
						itemId: 'scatter3d',
						flex: 1
					}]
				}, {
					// controls
					layout: {
						type: 'hbox',
						align: 'stretch'
					},
					items: [{
						// left controls
						layout: {
							type: 'vbox'
						},
						flex: 1,
						items: [{
							itemId: 'snapshot',
							xtype: 'checkbox',
							fieldLabel: 'Freeze'
						}, {
							itemId: 'rangeValue',
							xtype: 'numberfield',
							fieldLabel: 'Range',
							value: 10,
							step: 1
						}, {
							itemId: 'toleranceValue',
							xtype: 'numberfield',
							fieldLabel: 'Tolerance',
							value: 50,
							step: 1
						}, {
							layout: 'hbox',
							defaults: {
								width: 120
							},
							items: [{
								itemId: 'ybits',
								xtype: 'numberfield',
								fieldLabel: 'Y Bits',
								labelWidth: 50,
								value: 6,
								step: 1
							}, {
								itemId: 'cbbits',
								xtype: 'numberfield',
								fieldLabel: 'Cb Bits',
								labelWidth: 50,
								value: 6,
								step: 1
							}, {
								itemId: 'crbits',
								xtype: 'numberfield',
								fieldLabel: 'Cr Bits',
								labelWidth: 50,
								value: 6,
								step: 1
							}]
						}/*, {
							itemId: 'metaball',
							xtype: 'button',
							text: 'Metaball'
						}, {
							itemId: 'convexhull',
							xtype: 'button',
							text: 'Convex Hull'
						}*/]
					}, {
						// right controls
						layout: {
							type: 'vbox'
						},
						flex: 1,
						items: [{
							itemId: 'rawUnderlay',
							xtype: 'checkbox',
							checked: true,
							fieldLabel: 'Underlay'
						}, {
							itemId: 'rawUnderlayOpacity',
							xtype: 'numberfield',
							fieldLabel: 'Opacity',
							step: 0.1,
							value: 0.5,
							minValue: 0,
							maxValue: 1
						}, {
							itemId: 'renderYUVBox',
							xtype: 'checkbox',
							checked: false,
							fieldLabel: 'Render YUV'
						}, {
							itemId: 'renderCubeBox',
							xtype: 'checkbox',
							checked: false,
							fieldLabel: 'Render Cube'
						}]
					}]
				}]
			}]
		});

		return this.callParent(arguments);
	}
});
