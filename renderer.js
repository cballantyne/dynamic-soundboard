// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
const ipc = electron.ipcRenderer;

//const $ = selector => document.querySelector(selector)
const $ = require('jquery');

const $buttons = $('#buttons');
const $tabs = $('#tabs');
const $tabsList = $('#tabs-list');


ipc.on('draw-tabs-and-buttons', () => {

    console.log("Drawing tabs and buttons.");
    const folderWithFilesMap = require('electron').remote.getGlobal('folderWithFilesMap');

    // draw tabs
    console.log("Drawing " + folderWithFilesMap.size + " tabs.");

    $tabsList.html('');
    $buttons.html('');
    let index = 0;
    let firstTab = '';

    folderWithFilesMap.forEach(function(value, key){
        index++;
        if (index === 1) {
            firstTab = key;
        }

        const backgroundPath = './dist/' + key + '/background.png';
        let toAppend = '<div class="container fill" id="buttons-'+ key + '" style="background: url(\'' + backgroundPath + '\') no-repeat center;">';

        let buttonCount = 0;
        value.forEach(x => {
            buttonCount++;
            const buttonText = x.split("/")[1].split(".")[0].replace(/-/g, ' '); // remove folder and file extension. replace hyphen with space
            if (buttonCount === 1) {
                toAppend = toAppend + '<div class="row p-1">';
            }
            toAppend = toAppend + '<div class="col-sm">';
            toAppend = toAppend + '<button class="btn btn-primary text-truncate play-sound" name="' + x + '" title="' + buttonText + '">' + buttonText + '</button>';
            toAppend = toAppend + '</div>';

            if (buttonCount === 3) {
                toAppend = toAppend + '</div>';
                buttonCount = 0;
            }
        });

        if (buttonCount > 0) {
            toAppend = toAppend + '</div>';
        }



        toAppend = toAppend + '</div>';


        const tabText = key.replace(/-/g, ' ');
        $buttons.append(toAppend);
        $tabsList.append('<li class="nav-item"><a class="nav-link" id="tab-' + key + '" href="#">' + tabText + '</a></li>');

        if (index === folderWithFilesMap.size) {
            showTab(firstTab);
        }
    });
});

$buttons.on( "click", function(event) {
    console.log('click event');
    console.log(event);

    if (event.target.className.includes('play-sound')) {
        const audio = new Audio('./dist/' + event.target.name);
        //audio.loop = true
        audio.play().then(() => {
        }).catch((error) => {
            console.log('error playing sound', error);
        });
    } else if (event.target.id === 'loadFileBtn') {
        ipc.send('async-loadFile');
    }
});

$tabs.on( "click", function(event) {
    console.log(event);
    if (event.target.className === 'nav-link') {
        showTab(event.target.id.replace('tab-',''));
    }
});

function showTab(tabName) {
    console.log("showTab for " + tabName);
    $('.nav-link').removeClass('active');
    $('#tab-' + tabName).addClass('active');
    $( "div[id^='buttons-']" ).hide();
    $( "#buttons-" + tabName).show();
}
