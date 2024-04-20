"use strict";
window.onload = function() {
    // Adapt sizes to the screen size
    let settings = {
        screenW: window.innerWidth / 3 * 2,
        screenH: window.innerHeight - 100,
        hexSize: 46,
        hexOrientation: 'pointy',
        // hexColumns: Math.ceil((window.innerWidth - 100) / 54), // x
        // hexRows:  Math.ceil((window.innerHeight - 100) / (36*1.731)), // y
        hexColumns: 10,
        hexRows: 10,
        lineThickness: 2,
        lineColor: 0x999999,
        hideCoords: false
    };

    $('#hexSize').val(settings.hexSize);
    $('#hexOrientation').val(settings.hexOrientation);
    $('#hexColumns').val(settings.hexColumns);
    $('#hexRows').val(settings.hexRows);
    $('#lineThickness').val(settings.lineThickness);

    let canvas = document.getElementById("canvas");
    let app = new PIXI.Application({ width: settings.screenW, height: settings.screenH, transparent: true, preserveDrawingBuffer:true, view: canvas });

    loadGrid(app, settings);

    $("#gridSettingsModal").submit(function(){
        for (let i = app.stage.children.length - 1; i >= 0; i--) {
            app.stage.removeChild(app.stage.children[i]);
        }
        applySettings(app);
        return false;
    });
};

function loadGrid(app, settings) {
    const yOffset = (settings.hexSize + settings.lineThickness) / 2;

    let graphics = new PIXI.Graphics();
    let Hex = Honeycomb.extendHex({ size: settings.hexSize,  orientation: settings.hexOrientation });
    //let Hex = Honeycomb.extendHex({ size: {width: 72, height: 72},  orientation: settings.hexOrientation });
    let Grid = Honeycomb.defineGrid(Hex);

    // set a line style of 1px wide and color #999
    graphics.lineStyle(settings.lineThickness, settings.lineColor);

    // render hex grid
    let gr = Grid.rectangle({ width: settings.hexColumns, height: settings.hexRows });
    gr.forEach(hex => {
        const point = hex.toPoint();
        // add the hex's position to each of its corner points
        const corners = hex.corners().map(corner => corner.add(point));
        // separate the first from the other corners
        const [firstCorner, ...otherCorners] = corners;

        // move the "pen" to the first corner
        graphics.moveTo(firstCorner.x, firstCorner.y);
        // draw lines to the other corners
        otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
        // finish at the first corner
        graphics.lineTo(firstCorner.x, firstCorner.y);

        app.stage.addChild(graphics);

        const centerPosition = hex.center().add(point);
        const coordinates = hex.coordinates();

        let hexagon = new PIXI.Sprite(graphics.generateTexture());

        // Create hexagon sprite
        // Set position and interactive
        hexagon.position.set(centerPosition.x, centerPosition.y);
        hexagon.interactive = true;
        hexagon.anchor.set(0.5);
        hexagon.hex = hex;
        hex.sprite = hexagon;
        
        let fontSize = 24;
        
        let middleText = new PIXI.Text('', { fontFamily: 'Arial', fontSize: fontSize, fill: 0x6699CC, align: 'center' });
        middleText.x = centerPosition.x;
        middleText.y = centerPosition.y;
        middleText.anchor.set(0.5);
        hexagon.label = middleText;

        app.stage.addChild(middleText);

        if ((coordinates.x == 0) && (coordinates.y == 0)) {
            middleText.text = 'Start';
            middleText.fill = 0xFF0000;
        }
        else if ((coordinates.x == settings.hexColumns - 1) && (coordinates.y == settings.hexRows - 1)) {
            middleText.text = 'Boss';
            middleText.fill = 0xFF0000;
        }
        else {
            // let randomValue = Math.floor(Math.random() * 100) + 1;
            let randomValue = generateHexEvent();
            
            hexagon.label.text = randomValue.toString();
        }

        if (settings.hideCoords === false) {
            let fontSize = 12;
            if (settings.hexSize < 15) fontSize = settings.hexSize / 1.5;
            let text = new PIXI.Text(coordinates.x + ','+ coordinates.y,{fontFamily : 'Arial', fontSize: fontSize, fill : 0x6699CC, align : 'center'});
            text.x = centerPosition.x;
            text.y = centerPosition.y + yOffset;
            text.anchor.set(0.5);

            app.stage.addChild(text);
        }    

        // Attach hover event to the hexagon
        attachHoverEvent(hexagon);
        
        app.stage.addChild(hexagon);
    });
}

function applySettings(app) {
    let settings = {};
    settings.screenW = window.innerWidth - 100;
    settings.screenH = window.innerHeight - 100;
    settings.hexSize = parseInt($('#hexSize').val()) || 36;
    settings.hexOrientation = $('#hexOrientation').val() || 'flat';
    settings.hexColumns = parseInt($('#hexColumns').val()) || (window.innerWidth - 100) / 54;
    settings.hexRows = parseInt($('#hexRows').val()) || (window.innerHeight - 100) / 72;
    settings.lineThickness = parseInt($('#lineThickness').val()) || 2;
    settings.lineColor = 0x999999;
    settings.hideCoords = $('#hideCoords').is(":checked");

    loadGrid(app, settings);
    $("#gridSettingsModal").modal("hide");
}

function downloadCanvasAsPng() {
    ReImg.fromCanvas(document.querySelector('canvas')).downloadPng('hexGrid.png');
}

function generateHexEvent(){
    let eventRNG = Math.floor(Math.random() * 100) + 1;
    if (eventRNG <= 20) {
        //?
        //20%
        return '?';
    }
    else if (eventRNG <= 35) {
        //Shop
        //15%
        return '$';
    }
    else if (eventRNG <= 45) {
        //miniboss
        //10%
        return 'MB'
    }
    else if (eventRNG <= 60) {
        //Rest
        //15%
        return 'R';
    }
    else if (eventRNG <= 63) {
        //Chest
        //3%
        return 'C';
    }
    else {
        //Encounter
        //37%
        let terrain = '';
        switch(Math.floor(Math.random() * 6)){
            case 0:
                terrain = 'A';
                break;
            case 1:
                terrain = 'C';
                break;
            case 2:
                terrain = 'D';
                break;
            case 3:
                terrain = 'F';
                break;
            case 4:
                terrain = 'G';
                break;
            case 5:
                terrain = 'M';
                break;
            default:
                terrain = '';
        }
        return (terrain + (Math.floor(Math.random() * 100) + 1).toString());
    }
}

function attachHoverEvent(hex) {
    hex.on('mouseover', () => {
        
        showDetails(hex);
    });

    hex.on('mouseout', () => {

    });
    
    hex.on('click', () => {
        toggleHexColor(hex);

    });

    function showDetails(hex) {
        let hexDetails = document.getElementById('hexDetails');

        let title = '';
        let details = '';

        switch (hex.label.text){
            case '?':
                title = 'Random Event';
                details = randomEvent();
                break;
            case 'R':
                title = 'Rest Area';
                details = 'Players can short rest or upgrade an item.'
                break;
            case 'MB':
                title = 'Miniboss';
                details = generateMiniboss();
                break;
            case 'Start':
                title = 'Start';
                details = '';
                break;
            case 'Boss':
                title = 'Final Boss';
                details = generateBoss();
                break;
            case '$':
                title = 'Shop';
                details = generateShop();
                break;
            case 'C':
                title = 'Chest';
                details = generateChest();
                break;
            default:
                let terrain = '';
                switch (hex.label.text[0]) {
                    case 'A':
                        terrain = 'Arctic';
                        break;
                    case 'C':
                        terrain = 'Coast';
                        break;
                    case 'D':
                        terrain = 'Desert';
                        break;
                    case 'F':
                        terrain = 'Forrest';
                        break;
                    case 'G':
                        terrain = 'Grassland';
                        break;
                    case 'M':
                        terrain = 'Mountain';
                        break;
                    default:
                        terrain = 'Error';
                }
                title = `${terrain} ${hex.label.text.substr(1)}`;
                details = generateEncounter(terrain,hex.label.text.substr(1));
        }
        hexDetails.textContent = `${title} \n ${details}`;
    }
    function toggleHexColor(hex) {
        //console.log(`Middle Value: ${hex.label.text}`);  
        if (hex.selected) {
            hex.label.style.fill = 0x6699CC;
            hex.selected = false;
        }
        else {
            hex.label.style.fill = 0x171717;
            hex.selected = true;
        }
    }
    function randomEvent() {
        return '';
    }
    function generateMiniboss() {
        return '';
    }
    function generateBoss() {
        return '';
    }
    function generateShop() {
        return '';
    }
    function generateChest() {
        return '';
    }
    function generateEncounter(terrain, Value) {

        return '';
    }
}
