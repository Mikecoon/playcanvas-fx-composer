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