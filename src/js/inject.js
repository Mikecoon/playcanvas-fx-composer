
var composerDefaults = {
    name: "FX Composer",
    layoutUrl: null,
    configFileName: "Composer",
    configFileType: "json",
    sourceLayer: "World",
    screenLayer: "Immediate"
};

class Composer {

    constructor() {

        this.nodes = [];

        this.createButton(); // Button in toolbar
        this.createLayout(); // Layout for components
        this.createComponentsPanel(); // Left panel for components
        this.createWorkspacePanel(); // Right panel for nodes

        this.createPlumb().then(plumb => {


            let allLayers = editor.call('settings:project').get('layers');
            let layersOrder = editor.call('settings:project').get('layerOrder');


            this.getConfig().then(nodes => {

                nodes.forEach(config => {

                    // If World or Screen
                    if (config.layer === composerDefaults.sourceLayer || config.layer === composerDefaults.screenLayer) {

                        if (config.layer === "Immediate") config.name = "Screen";
                        if (config.layer === "World") config.name = "World";

                        this.addNode({
                            name: config.name,
                            type: "layer",
                            fixed: true,
                            in: config.name === "Screen",
                            out: config.name === "World",
                        })
                    } else {
                        this.addNode({
                            name: config.layer + " layer",
                            type: "layer",
                            fixed: false,
                        })
                    }
                })

                this.nodes.forEach((source, i) => {

                    let target = this.nodes[nodes[i].out];

                    console.log(source);
                    console.log(target);

                    if (source && target) {
                        this.plumb.connect({
                            uuids: [source.name + "In", target.name + "Out"],
                            editable: true
                        });
                    }

                   /* jsPlumb.connect({
                        source:"aThirdElement",
                        target:"yetAnotherElement",
                        detachable:false
                    });*/
                })
            })
        })

    }

    addNode(config) {

        config.plumb = this.plumb;
        let node = new ComposerNode(config);
        this.workspace.append(node);
        node.addToPlumb();
        this.plumb.draggable(node.element, {
            containment:true
        });


        this.nodes.push(node);

        return node;
    }

    createPlumb() {

        return new Promise((resolve, reject) => {

            let promises = [];

            let jqueryUI = new Promise((resolve, reject) => {
                $.ready.then(() => {
                    return resolve();
                })
            });

            promises.push(jqueryUI);

            let Plumb = new Promise((resolve, reject) => {
                jsPlumb.ready(() => {
                    this.plumb = jsPlumb.getInstance({
                        DragOptions: { cursor: 'pointer', zIndex: 2000},
                        Container: "canvas"
                    });

                    // Source
                    this.plumb._sourceEndpoint = {
                        endpoint: "Dot",
                        paintStyle: { fill: "#536A6D", radius: 7 },
                        isSource: true,
                        connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                        connectorStyle: { strokeWidth: 2, stroke: "#20292b", joinstyle: "round", }, // Line
                        connectorHoverStyle: { strokeWidth: 3, stroke: "#216477" },  // Line hover
                        hoverPaintStyle: { fill: "#216477", stroke: "#216477" }, // Endpoint hover
                        dragOptions: {},
                    };

                    // Source fixed
                    this.plumb._fixedSourceEndpoint = Object.assign({},this.plumb._sourceEndpoint, {
                        paintStyle: { fill: "#FF6600", radius: 7 },
                    });

                    // Target
                    this.plumb._targetEndpoint = {
                        endpoint: "Dot",
                        paintStyle: { stroke: "#536A6D", fill: "#293538", radius: 7, strokeWidth: 1 },
                        hoverPaintStyle: this.plumb._sourceEndpoint.hoverPaintStyle,
                        maxConnections: -1,
                        dropOptions: { hoverClass: "hover", activeClass: "active" },
                        isTarget: true,
                    };

                    // Target fixed
                    this.plumb._fixedTargetEndpoint = Object.assign({}, this.plumb._targetEndpoint, {
                        paintStyle: {
                            stroke: "#FF6600",
                            fill: "#293538",
                            radius: 7,
                            strokeWidth: 1
                        }
                    });

                    this.plumb.batch(() => resolve(this.plumb));
                })
            });

            promises.push(Plumb);

            Promise.all(promises).then( () => resolve());
        })
    }

    createButton() {
        let layout = editor.call('layout.toolbar');
        this.button = new ui.Button();

        this.button.class.add('ui-button');
        this.button.class.add('ui-composer-btn');
        this.button.text = "FX";

        layout.append(this.button);

        Tooltip.attach({
            target: this.button.element,
            text: 'FX Composer',
            align: 'left',
            root: editor.call('layout.root')
        });

        this.button.on('click', event => {
            editor.call('help:composer', 'Composer');
        });
    }
    createLayout() {

        let overlay = new ui.Overlay();
        overlay.class.add('fx-composer');
        overlay.style.zIndex = 203;
        overlay.center = true;
        overlay.hidden = true;

        overlay.element.addEventListener('mousewheel', function(evt) {
            evt.stopPropagation();
        });

        // header
        let header = new ui.Label();
        header.text = composerDefaults.name;
        header.class.add('header');
        overlay.append(header);

        // close
        let btnClose = new ui.Button();
        btnClose.class.add('close');
        btnClose.text = '&#57650;';
        btnClose.on('click', function() {
            overlay.hidden = true;
        });

        header.element.appendChild(btnClose.element);

        this.container = new ui.Panel();
        this.container.class.add('container');
        this.container.class.add('composer-container');
        overlay.append(this.container);

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
    }

    createComponentsPanel() {
        this.components = new ui.Panel();
        this.components.class.add("left");
        this.container.append(this.components);
    }

    createWorkspacePanel() {
        this.workspace = new ui.Panel();
        this.workspace.class.add("right");
        this.container.append(this.workspace);
    }

    getConfig() {

        return new Promise((resolve, reject) => {
            Ajax({ url: '{{url.api}}/projects/{{project.id}}/assets?view=coder', auth: true }) .on('load', function(status, data) {

                var fileFound = false;

                data.forEach(asset => {
                    // Specific file
                    if (asset.name === composerDefaults.configFileName && asset.type === composerDefaults.configFileType) {

                        fileFound = true;

                        // Load config from
                        Ajax({
                            url: asset.file.url,
                            auth: true
                        })
                        .on('load', function (status, data) {
                            return resolve(data);
                        });
                    }
                })

                if (!fileFound) return reject(false);

                if (!data.length) return reject(false);
            })
        })

    }
}

var composer = new Composer();
