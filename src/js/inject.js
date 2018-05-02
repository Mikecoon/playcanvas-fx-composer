
let layout = editor.call('layout.toolbar');
let button = new ui.Button();


button.class.add('ui-button');
button.class.add('ui-composer-btn');
button.text = "FX";

layout.append(button);

Tooltip.attach({
    target: button.element,
    text: 'FX Composer',
    align: 'left',
    root: editor.call('layout.root')
});


button.on('click', event => {
    editor.call('help:composer', 'Composer');
});


var overlay = new ui.Overlay();
overlay.class.add('help-controls');
overlay.style.zIndex = 203;
overlay.center = true;
overlay.hidden = true;

overlay.element.addEventListener('mousewheel', function(evt) {
    evt.stopPropagation();
});

// header
var header = new ui.Label();
header.text = 'FX composer';
header.class.add('header');
overlay.append(header);

// close
var btnClose = new ui.Button();
btnClose.class.add('close');
btnClose.text = '&#57650;';
btnClose.on('click', function() {
    overlay.hidden = true;
});
header.element.appendChild(btnClose.element);

// top image
var imgTop = new Image();
imgTop.src = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/help-controls.png';
imgTop.classList.add('top');
imgTop.draggable = false;
overlay.append(imgTop);

var container = new ui.Panel();
container.class.add('container');
overlay.append(container);

editor.call('layout.root').append(overlay);


editor.method('help:composer', ()=> {
    overlay.hidden = false;
});

overlay.on('show', () =>{
    editor.emit('help:composer:open');

});

overlay.on('hide', () =>{
    editor.emit('help:composer:close');
});