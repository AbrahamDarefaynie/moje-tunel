import 'https://unpkg.com/forge-iot-extensions@0.0.5/dist/index.js';
import { initViewer, loadModel, adjustPanelStyle } from './viewer.js';
import { initTimeline } from './timeline.js';
import { MyDataView } from './dataview.js';
import './sensormanager.js';
//updated- imported
import './EditorExt.js';
import './RobotExt.js';



//updated-commented
const FORGE_MODEL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWIxMjM0LzA5MjlDYWJsZVR5cGUucnZ0';
//const FORGE_MODEL_VIEW = 'e4baebbb-4ad6-8223-7f6a-cad4f0bb354a';
const FORGE_MODEL_DEFAULT_FLOOR_INDEX = 2;
const DEFAULT_TIMERANGE_START = new Date('2022-01-01');
const DEFAULT_TIMERANGE_END = new Date('2022-01-30');

//Moji Kinetic
//const position = viewer.getposition();

const IOT_EXTENSION_IDS = ['IoT.SensorList', 'IoT.SensorDetail', 'IoT.SensorSprites', 'IoT.SensorHeatmaps'];
const IOT_PANEL_STYLES = {
    'IoT.SensorList': { right: '10px', top: '10px', width: '500px', height: '300px' },
    'IoT.SensorDetail': { right: '10px', top: '320px', width: '500px', height: '300px' },
    'IoT.SensorHeatmaps': { left: '10px', top: '320px', width: '300px', height: '150px' }
};

let dataView = new MyDataView();
await dataView.init({ start: DEFAULT_TIMERANGE_START, end: DEFAULT_TIMERANGE_END });
let extensions = [];

//Moji Kinetic
// const divID = 'MyViewerDiv';
// let extensionArray = [];
// let viewerApp = new Autodesk.Viewing.ViewingApplication(divID);
// let viewer = null;
// let config3d = {
//     extensions: extensionArray
// };


// Autodesk.Viewing.Initializer(options, function onInitialized() {
//      viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config3d);
//      viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
// });
//Moji Kinetic



async function onTimeRangeChanged(start, end) {
    await dataView.refresh({ start, end });
    extensions.forEach(ext => ext.dataView = dataView);
}
function onLevelChanged({ target, levelIndex }) {
    dataView.floor = levelIndex !== undefined ? target.floorData[levelIndex] : null;
    extensions.forEach(ext => ext.dataView = dataView);
}
function onTimeMarkerChanged(time) {
    extensions.forEach(ext => ext.currentTime = time);
}
function onCurrentSensorChanged(sensorId) {
    const sensor = dataView.getSensors().get(sensorId);
    if (sensor && sensor.objectId) {
        viewer.fitToView([sensor.objectId]);
    }
    extensions.forEach(ext => ext.currentSensorID = sensorId);
}
function onCurrentChannelChanged(channelId) {
    extensions.forEach(ext => ext.currentChannelID = channelId);
}


//Moji Kinetic
//Init after the viewer is ready
// function onDocumentLoadSuccess() {
//     let viewables = viewerApp.bubble.search({
//         'type': 'geometry'
//     });
//     if (viewables.length === 0) {
//         console.error('Document contains no viewables.');
//         return;
//     }
//     // Choose any of the available viewables
//     viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);

// }

// function onDocumentLoadFailure(viewerErrorCode) {
//     console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
// }

// function onItemLoadSuccess(active_viewer, item) {
//     console.log('Document loaded successfully');
//     viewer = active_viewer;

//     viewer.loadExtension('EditorExtension').then(
//         function(myExtension) {

//             myExtension.setExtensionParams("RobotExtension", "/public/RobotExt.js");
//         })
// }
// function onItemLoadFail(errorCode) {
//     console.error('onItemLoadFail() - errorCode:' + errorCode);
// }
//Moji Kinetic






initTimeline(document.getElementById('timeline'), onTimeRangeChanged, onTimeMarkerChanged);
const viewer = await initViewer(document.getElementById('preview'), IOT_EXTENSION_IDS.concat(['Iot.SensorManager', 'Autodesk.AEC.LevelsExtension']));
//updated- parameter changed 
//loadModel(viewer, FORGE_MODEL_URN, FORGE_MODEL_VIEW);
//console.log("load");
loadModel(viewer, FORGE_MODEL_URN);
viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function () {
    // Setup and auto-activate IoT extensions
    for (const extensionID of IOT_EXTENSION_IDS) {
        const extension = viewer.getExtension(extensionID);
        extensions.push(extension);
        extension.dataView = dataView;
        extension.activate();
        if (IOT_PANEL_STYLES[extensionID]) {
            adjustPanelStyle(extension.panel, IOT_PANEL_STYLES[extensionID]);
        }
    }

    const sensorMgrExt = viewer.getExtension('Iot.SensorManager');
    sensorMgrExt.onSensorAdded = async (data) => {
        await dataView.addSensors(data);

        let timeRange = dataView.getTimerange();
        await dataView.refresh({ start: timeRange[0], end: timeRange[1] });

        extensions.forEach(ext => ext.dataView = dataView);
    };
    sensorMgrExt.onSensorDeleted = async (sensorId) => {
        await dataView.deleteSensors(sensorId);

        let timeRange = dataView.getTimerange();
        await dataView.refresh({ start: timeRange[0], end: timeRange[1] });

        extensions.forEach(ext => {
            ext.dataView = dataView;
            ext.currentSensorID = null;
        });
    };

    // Setup and auto-activate other viewer extensions
    const levelsExt = viewer.getExtension('Autodesk.AEC.LevelsExtension');
    levelsExt.levelsPanel.setVisible(true);
    levelsExt.floorSelector.addEventListener(Autodesk.AEC.FloorSelector.SELECTED_FLOOR_CHANGED, onLevelChanged);
    levelsExt.floorSelector.selectFloor(FORGE_MODEL_DEFAULT_FLOOR_INDEX, true);
    adjustPanelStyle(levelsExt.levelsPanel, { left: '10px', top: '10px', width: '300px', height: '300px' });

    onTimeRangeChanged(DEFAULT_TIMERANGE_START, DEFAULT_TIMERANGE_END);
    viewer.getExtension('IoT.SensorList').onSensorClicked = (sensorId) => onCurrentSensorChanged(sensorId);
    viewer.getExtension('IoT.SensorSprites').onSensorClicked = (sensorId) => onCurrentSensorChanged(sensorId);
    viewer.getExtension('IoT.SensorHeatmaps').onChannelChanged = (channelId) => onCurrentChannelChanged(channelId);
	
	//updated- extension loader added 
    //viewer.loadExtension('EditorExtension').then(
        //    function(myExtension) {

      //         myExtension.setExtensionParams("RobotExtension", "/RobotExt.js");

    //       });
    viewer.loadExtension('RobotExtension');
    //viewer.impl.setPostProcessParameter('RobotExtension');
    viewer.loadDocumentNode('RobotExtension')
});
