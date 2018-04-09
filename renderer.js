// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
const jquery = require('jquery')
const ipc = electron.ipcRenderer;

//const $ = selector => document.querySelector(selector)
var $ = require('jquery');

const $buttons = $('#buttons')
const $tabs = $('#tabs')
const $tabsList = $('#tabs-list')


ipc.on('draw-tabs-and-buttons', (event) => {

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

        let lp = value.forEach(x => {
            const buttonText = x.split("/")[1].split(".")[0]; // remove folder and file extension
            toAppend = toAppend + '<div class="row">';
            toAppend = toAppend + '<div class="col-sm">';
            toAppend = toAppend + '<button class="play-sound" name="' + x + '">' + buttonText + '</button>'
            toAppend = toAppend + '</div>';
            toAppend = toAppend + '</div>';
        });
        toAppend = toAppend + '</div>';

        $buttons.append(toAppend);
        $tabsList.append('<li class="nav-item"><a class="nav-link" id="tab-' + key + '" href="#">' + key + '</a></li>');

        if (index === folderWithFilesMap.size) {
            showTab(firstTab);
        }
    });
});

$buttons.on( "click", function(event) {
    console.log('click event');
    console.log(event)

    if (event.target.className == 'play-sound') {
        const audio = new Audio('./dist/' + event.target.name)
        //audio.loop = true
        audio.play();
    } else if (event.target.id == 'loadFileBtn') {
        ipc.send('async-loadFile');
    }
});

$tabs.on( "click", function(event) {
    console.log('click event');
    console.log(event)
    if (event.target.className == 'nav-link') {
        showTab(event.target.innerText);
    }
});

function showTab(tabName) {
    console.log("showTab for " + tabName);
    $('.nav-link').removeClass('active');
    $('#tab-' + tabName).addClass('active')
    $( "div[id^='buttons-']" ).hide();
    $( "#buttons-" + tabName).show();
}
