Ext.define('NU.model.Robot', {
    extend: 'Ext.data.Model',
    fields: [
        'rShoulderPitch',
        'lShoulderPitch',
        'rShoulderRoll',
        'lShoulderRoll',
        'rElbow',
        'lElbow',
        'rHipYaw',
        'lHipYaw',
        'rHipRoll',
        'lHipRoll',
        'rHipPitch',
        'lHipPitch',
        'rKnee',
        'lKnee',
        'rAnklePitch',
        'lAnklePitch',
        'rAnkleRoll',
        'lAnkleRoll',
        'headYaw',
        'headPitch'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'robots'
        }
    }
});
