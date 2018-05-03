class ComposerNode {

    constructor(config) {

        // Setup config
        this.config = {
            left: 150, top: 150,
            name: "Unnamed", type: "layer",
            out: true, in: true, fixed: false, plumb: null,
        };

        this.config = Object.assign(this.config, config);

        // Create element
        this.element = document.createElement("div");
        this.element.classList.add("node");
        this.element.classList.add(this.config.type);
        if (this.config.fixed) this.element.classList.add("fixed");
        this.element.id = this.name + "_" + this.type;
        //this.element.id = "node-1";

        // Set config
        this.element.innerText = this.config.name;
        this.left = this.config.left;
        this.top = this.config.top;

        ui.ContainerElement.call(this);
    }

    set left(newValue) {
        this.element.style.left = newValue + "px";
    }

    set top(newValue) {
        this.element.style.top = newValue + "px";
    }

    addToPlumb() {
        let source = this.fixed ? this.plumb._fixedSourceEndpoint: this.plumb._sourceEndpoint;
        let target = this.fixed ? this.plumb._fixedTargetEndpoint: this.plumb._targetEndpoint;

        if (this.config.out) {
            this.plumb.addEndpoint(this.id, source, {
                anchor: "RightMiddle", uuid: this.name + "In"
            });
        }

        if (this.config.in) {
           this.plumb.addEndpoint(this.id, target, {
                anchor: "LeftMiddle", uuid: this.name + "Out"
            });
        }
    }

    get plumb() {return this.config.plumb};
    get fixed() {return this.config.fixed};
    get name() {return this.config.name};
    get type() {return this.config.type};
    get id() {return this.element.id};
}

var composerDefaults = {
    name: "FX Composer",
    layoutUrl: null,
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

            let customLayers = layersOrder.map((order, i) => {

                let layer = allLayers[i];

                if (layer) {
                    if (layer.name === "World") {
                        this.addNode({
                            name: "World layer",
                            top: 50,
                            left: 100,
                            fixed: true,
                            in: false
                        })
                    }

                    if (layer.name === "Immediate") {
                        this.addNode({
                            name: "Screen",
                            top: 50,
                            left: 300,
                            fixed: true,
                            out: false
                        })
                    }
                }

                if  (order.layer > 4) {
                    let layer = allLayers[order.layer];

                    this.addNode({
                        name: layer.name,
                        top: 50,
                        left: 500,
                        type: "fx"
                    })
                }
            });



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
}

var composer = new Composer();
