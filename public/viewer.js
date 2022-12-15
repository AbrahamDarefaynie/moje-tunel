/// import * as Autodesk from "@types/forge-viewer";

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}

export function initViewer(container, extensions) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, { extensions });
            viewer.start();
            resolve(viewer);
        });
    });
}


// function initViewer() {
    // Create a new instance of the Forge Viewer
    // var viewer = new Autodesk.Viewing.Viewer3D(document.getElementById('extensions'));

    // Load the model into the viewer
    // viewer.loadModel(modelUrl, {}, function () {
        // Once the model is loaded, you can use the viewer to do any additional setup or processing that you need

        // For example, you might want to set the initial view of the model
        // viewer.autocam.setCurrentViewAsHome();
//     });
// }
// window.onload = function () {
//     initViewer();
// }







// Initialize the viewer and get the Viewer object
// initViewer('#viewer', ['MyExtension1', 'MyExtension2']).then(function (viewer) {

    // Use the Viewer object to load a model into the viewer
//     viewer.loadModel('https://example.com/my-model.rvt');
// });



export function loadModel(viewer, urn) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            //const viewable = guid ? doc.getRoot().findByGuid(guid) : doc.getRoot().getDefaultGeometry();
            //resolve(viewer.loadDocumentNode(doc, viewable));
			resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

export function adjustPanelStyle(panel, { left, right, top, bottom, width, height }) {
    const style = panel.container.style;
    style.setProperty('left', left ? left : 'unset');
    style.setProperty('right', right ? right : 'unset');
    style.setProperty('top', top ? top : 'unset');
    style.setProperty('bottom', bottom ? bottom : 'unset');
    style.setProperty('width', width ? width : 'unset');
    style.setProperty('height', height ? height : 'unset');
}











// Moji kinetic

// initViewer(document.getElementById('preview')).then(viewer => {
//     const urn = window.location.hash?.substring(1);
//     setupModelSelection(viewer, urn);
//     setupModelUpload(viewer);
// });

// async function setupModelSelection(viewer, selectedUrn) {
//     const dropdown = document.getElementById('models');
//     dropdown.innerHTML = '';
//     try {
//         const resp = await fetch('/api/models');
//         if (!resp.ok) {
//             throw new Error(await resp.text());
//         }
//         const models = await resp.json();
//         dropdown.innerHTML = models.map(model => `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`).join('\n');
//         dropdown.onchange = () => onModelSelected(viewer, dropdown.value);
//         if (dropdown.value) {
//             onModelSelected(viewer, dropdown.value);
//         }
//     } catch (err) {
//         alert('Could not list models. See the console for more details.');
//         console.error(err);
//     }
// }

// async function setupModelUpload(viewer) {
//     const upload = document.getElementById('upload');
//     const input = document.getElementById('input');
//     const models = document.getElementById('models');
//     upload.onclick = () => input.click();
//     input.onchange = async () => {
//         const file = input.files[0];
//         let data = new FormData();
//         data.append('model-file', file);
//         if (file.name.endsWith('.zip')) { // When uploading a zip file, ask for the main design file in the archive
//             const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
//             data.append('model-zip-entrypoint', entrypoint);
//         }
//         upload.setAttribute('disabled', 'true');
//         models.setAttribute('disabled', 'true');
//         showNotification(`Uploading model <em>${file.name}</em>. Do not reload the page.`);
//         try {
//             const resp = await fetch('/api/models', { method: 'POST', body: data });
//             if (!resp.ok) {
//                 throw new Error(await resp.text());
//             }
//             const model = await resp.json();
//             setupModelSelection(viewer, model.urn);
//         } catch (err) {
//             alert(`Could not upload model ${file.name}. See the console for more details.`);
//             console.error(err);
//         } finally {
//             clearNotification();
//             upload.removeAttribute('disabled');
//             models.removeAttribute('disabled');
//             input.value = '';
//         }
//     };
// }

// async function onModelSelected(viewer, urn) {
//     if (window.onModelSelectedTimeout) {
//         clearTimeout(window.onModelSelectedTimeout);
//         delete window.onModelSelectedTimeout;
//     }
//     window.location.hash = urn;
//     try {
//         const resp = await fetch(`/api/models/${urn}/status`);
//         if (!resp.ok) {
//             throw new Error(await resp.text());
//         }
//         const status = await resp.json();
//         switch (status.status) {
//             case 'n/a':
//                 showNotification(`Model has not been translated.`);
//                 break;
//             case 'inprogress':
//                 showNotification(`Model is being translated (${status.progress})...`);
//                 window.onModelSelectedTimeout = setTimeout(onModelSelected, 5000, viewer, urn);
//                 break;
//             case 'failed':
//                 showNotification(`Translation failed. <ul>${status.messages.map(msg => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`);
//                 break;
//             default:
//                 clearNotification();
//                 loadModel(viewer, urn);
//                 break; 
//         }
//     } catch (err) {
//         alert('Could not load model. See the console for more details.');
//         console.error(err);
//     }
// }

// function showNotification(message) {
//     const overlay = document.getElementById('overlay');
//     overlay.innerHTML = `<div class="notification">${message}</div>`;
//     overlay.style.display = 'flex';
// }

// function clearNotification() {
//     const overlay = document.getElementById('overlay');
//     overlay.innerHTML = '';
//     overlay.style.display = 'none';
// }