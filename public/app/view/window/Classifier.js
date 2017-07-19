Ext.define('NU.view.window.Classifier', {
	extend : 'NU.view.window.Display',
	requires: [
		'NU.view.window.ClassifierController',
		'NU.view.plot.Scatter3D',
		'NU.view.LayeredCanvas',
		'NU.view.camera.Selector',
		'Ext.form.field.Checkbox'
	],
	alias : ['widget.nu_classifier_window'],
	controller: 'Classifier',
	title: 'Classifier',
	width: 800,
	height: 780,
	onEsc: function () {
		this.fireEvent('esc');
	},
	layout: {
		type: 'vbox',
		align: 'stretch',
		flex: 1
	},
	listeners: {
		afterrender: 'onAfterRender',
		esc: 'onEsc'
	},
	tbar: {
		xtype: 'toolbar',
		layout: {
			overflowHandler: 'Menu'
		},
		items: [{
			xtype: 'robot_selector',
			listeners: {
				selectRobot: 'onSelectRobot'
			}
		}, {
            xtype: 'camera_selector',
            listeners: {
                selectCamera: 'onSelectCamera'
            }
        }, '->', {
			text: 'Undo',
			listeners: {
				click: 'onUndo'
			}
		}, {
			text: 'Redo',
			listeners: {
				click: 'onRedo'
			}
		}, {
			text: 'Reset',
			listeners: {
				click: 'onReset'
			}
		}, {
			text: 'Download',
			listeners: {
				click: 'onDownload'
			}
		}, {
			text: 'Upload',
			listeners: {
				click: 'onUpload'
			}
		}, {
			text: 'Refresh',
			listeners: {
				click: 'onRefresh'
			}
		}]
	},
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'left',
		items: [{
			iconCls: 'icon-pencil',
			toggleGroup: 'tool',
			allowDepress: false,
			tooltip: 'Point Tool - Classify the point clicked on +/- the range (right click to unclassify the point)',
			listeners: {
				click: 'onToolPoint'
			}
		}, {
			iconCls: 'icon-wand',
			toggleGroup: 'tool',
			pressed: true,
			allowDepress: false,
			tooltip: 'Magic Wand Tool - Select the point clicked and similar surrounding pixels using tolerance (right click to classify, ctrl+click to quickly classify without selecting)',
			listeners: {
				toggle: 'onToolMagicWand'
			}
		}, {
			iconCls: 'icon-shape-square',
			toggleGroup: 'tool',
			allowDepress: false,
			tooltip: 'Rectangle Tool - Draw a rectangle with two points, second click will apply (right click to remove last point)',
			listeners: {
				toggle: 'onToolRectangle'
			}
		}, {
			iconCls: 'icon-toolbar-ellipse',
			toggleGroup: 'tool',
			allowDepress: false,
			tooltip: 'Ellipse Tool - Draw an ellipse with two points, second click will apply (right click to remove last point)',
			listeners: {
				toggle: 'onToolEllipse'
			}
		}, {
			iconCls: 'icon-toolbar-polygon',
			toggleGroup: 'tool',
			allowDepress: false,
			tooltip: 'Polygon Tool - Draw a polygon with a set of points, double click to apply (right click to remove last point)',
			listeners: {
				toggle: 'onToolPolygon'
			}
		}, '-', {
			iconCls: 'icon-toolbar-zoom',
			enableToggle: true,
			pressed: false,
			tooltip: 'Enables a zoom overlay',
			listeners: {
				toggle: 'onToolZoom'
			}
		}, {
			iconCls: 'icon-page-white-paint',
			enableToggle: true,
			tooltip: 'Enables the overwriting of already classified colours (needed for unclassifying)',
			listeners: {
				toggle: 'onToggleOverwrite'
			}
		}, '-', {
			iconCls: 'icon-toolbar-green',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'Field',
			pressed: true,
			listeners: {
				click: 'onTargetGreen'
			}
		}, {
			iconCls: 'icon-toolbar-orange',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'N/A',
			listeners: {
				click: 'onTargetOrange'
			}
		}, {
			iconCls: 'icon-toolbar-yellow',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'Ball',
			listeners: {
				click: 'onTargetYellow'
			}
		}, {
			iconCls: 'icon-toolbar-cyan',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'Cyan',
			listeners: {
				click: 'onTargetCyan'
			}
		}, {
			iconCls: 'icon-toolbar-magenta',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'Magenta',
			listeners: {
				click: 'onTargetMagenta'
			}
		}, {
			iconCls: 'icon-toolbar-white',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'Line',
			listeners: {
				click: 'onTargetWhite'
			}
		}, {
			iconCls: 'icon-toolbar-black',
			toggleGroup: 'target',
			allowDepress: false,
			tooltip: 'Unclassified',
			listeners: {
				click: 'onTargetBlack'
			}
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
						reference: 'rawImage',
						width: 320,
						height: 240,
						style: {
							backgroundColor: '#000',
							cursor: 'crosshair'
							// backgroundImage: "url('resources/images/camera.png')",
							// backgroundRepeat: 'no-repeat',
							// backgroundPosition: 'center',
						}
					}
				}, {
					// classified
					layout: 'fit',
					flex: 1,
					style: {
						display: 'block',
						border: '2px solid #000',
						borderRadius: '2px',
						position: 'relative'
					},
					items: {
						xtype: 'nu_layered_canvas',
						reference: 'classifiedImage',
						width: 320,
						height: 240,
						style: {
							backgroundColor: '#000',
							cursor: 'crosshair'
						}
					}
				}]
			}, {
				layout: {
					type: 'card',
					// align: 'stretch'
				},
				flex: 1,
				reference: 'rightPanel',
				items: [
					{
						// 3d scatter
						xtype: 'scatter3d',
						reference: 'scatter3d',
						flex: 1
					},
					{
						// Zoom overlay canvas
						xtype: 'nu_layered_canvas',
						reference: 'zoomCanvas',
						// flex: 1,
						style: {
							backgroundColor: 'black',
							height: '100%'
						}
					}
				]
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
					xtype: 'checkbox',
					fieldLabel: 'Freeze',
					listeners: {
						change: 'onChangeSnapshot'
					}
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Range',
					value: 10,
					step: 1,
					listeners: {
						change: 'onChangeRange'
					}
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Tolerance',
					value: 50,
					minValue: 0,
					maxValue: Math.ceil(Math.sqrt(3 * 255 * 255)),
					step: 1,
					listeners: {
						change: 'onChangeTolerance'
					},
					reference: 'tolerance'
				}, {
					layout: 'hbox',
					defaults: {
						width: 120
					},
					items: [{
						xtype: 'numberfield',
						reference: 'bitsR',
						fieldLabel: 'Y Bits',
						labelWidth: 50,
						value: 6,
						maxValue: 8,
						step: 1,
						listeners: {
							change: 'onChangeBitsR'
						}
					}, {
						xtype: 'numberfield',
						reference: 'bitsG',
						fieldLabel: 'Cb Bits',
						labelWidth: 50,
						value: 6,
						minValue: 1,
						maxValue: 8,
						step: 1,
						listeners: {
							change: 'onChangeBitsG'
						}
					}, {
						xtype: 'numberfield',
						reference: 'bitsB',
						fieldLabel: 'Cr Bits',
						labelWidth: 50,
						value: 6,
						minValue: 1,
						maxValue: 8,
						step: 1,
						listeners: {
							change: 'onChangeBitsB'
						}
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
					xtype: 'checkbox',
					checked: true,
					fieldLabel: 'Underlay',
					listeners: {
						change: 'onChangeRawUnderlay'
					}
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Opacity',
					step: 0.1,
					value: 0.5,
					minValue: 0,
					maxValue: 1,
					listeners: {
						change: 'onChangeRawUnderlayOpacity'
					}
				}, {
					layout: {
						type: 'hbox'
					},
					flex: 1,
					items: [{
						xtype: 'checkbox',
						checked: false,
						fieldLabel: 'Render YUV',
						listeners: {
							change: 'onChangeRenderYUVBox'
						}
					}, {
						xtype: 'combo',
						fieldLabel: 'Colour Space',
						store: {
							fields: ['id', 'name'],
							data : [
								{'id': 1, 'name':'YCbCr'},
								{'id': 2, 'name':'RGB'}
							]
						},
						queryMode: 'local',
						displayField: 'name',
						valueField: 'id',
						value: 1,
						listeners: {
							change: 'onChangeOutputColourSpace'
						}
					}]
				}, {
					xtype: 'checkbox',
					checked: false,
					fieldLabel: 'Render Cube',
					listeners: {
						change: 'onChangeRenderCubeBox'
					}
				}]
			}]
		}]
	}]
});
