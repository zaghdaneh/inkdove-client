/**
 * Handles the canvas, the buttons that changes stuff to draw
 */
function Canvas() {
    //selectors
    this.$canvas = $('#myCanvas');
    this.$colorbtns = $('.color-b');
    this.$widthbtns = $('.sizebtn');
    this.$instrumentbtns = $('.drawop-btn');
    this.$eraserBtn = $('#eraser');
    this.$floodfillBtn = $('#floodfill');
    this.$clearbtn = $('#clear-canv');
    this.$customColor = $('#cus-color');
    //data
    this.canDraw = false;
    this.sendInterval = 5;
    this.stack = []; //when player is drawer
    this.receivedStack = []; //when another is drawer
    this.intervalObj = null;
    this.lastX = 0;
    this.lastY = 0;
    this.color = '#000000';
    /**
     * States
     * 0 - Drawing with pencil (position + color + width)
     * 1 - Erasing (position)
     * 2 - fill paint (color, position?)
     */
    this.state = 0;
    this.width = 2;
    this.cursor = "cu_cus"; //actual cursor associated to drawing width
    this.mousePressed = false;
    this.$selectedColor = $('#initCanvasBtn');

    this.eraserColor = '#f2f3f3';
    this.eraserWidth = 14;

    //observers
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (rd, pd, ingameData = null) => this.joinRoomcb.call(this, ingameData));
    socket.addObserver(constant_data.MSG_TYPES.END_TURN, (...args) => this.disable.call(this, ...args)); //todo not clear just disabled input
    socket.addObserver(constant_data.MSG_TYPES.DRAW_CLEAR, (...args) => this.clear.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.DRAW, (...args) => this.drawReceived.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.NEW_DRAWER, (...args) => this.clear.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.WORDS_CHOICE, (...args) => this.clear.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW, (...args) => this.startHearing.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW_D, (...args) => this.startDrawing.call(this, ...args));

    //setup
    this.ctx = this.$canvas[0].getContext("2d");

    this.$colorbtns.each(function(){
        $(this).css("background-color", $(this).val());
        
    });
    this.$canvas.mouseup((e) => {
        this.mousePressed = false;
    });
    this.$canvas.mouseleave((e) => {
        this.mousePressed = false;
    });
    this.$colorbtns.click((e) => {
        this.color = $(e.target).val();
        $(e.target).addClass('selected_color');
        this.$selectedColor.removeClass('selected_color');
        this.$selectedColor = $(e.target);
    });
    this.$customColor.change((e) => {
        this.color = (this.$customColor.val());
        $(e.target).addClass('selected_color');
        this.$selectedColor.removeClass('selected_color');
        this.$selectedColor = $(e.target);
    });
    this.$selectedInstrument = $('.drawop-btn');

    this.$instrumentbtns.click((e) => {
        $(e.target).addClass('selected_instrument');
        this.$selectedInstrument.removeClass('selected_instrument');
        this.$selectedInstrument = $(e.target);
    });
    this.$widthbtns.click((e) => {
        //set cursor
        this.state = 0;
        var newclass = 'cu_' + e.target.id;
        this.changeCursor.call(this, newclass)
        //actual width change
        this.width = $(e.target).val();

    });

    this.$eraserBtn.click((e) => {
        this.state = 1;
        this.changeCursor.call(this, 'cu_eraser');
    });

    this.$floodfillBtn.click((e) => {
        this.state = 2;
        this.changeCursor.call(this, 'cu_bucket');
    });
    this.$canvas.mousedown((e) => {
        if (!(this.canDraw)) {
            return;
        }
        this.mousePressed = true;
        this.localDraw.call(this, e.clientX - $(e.target).offset().left, e.clientY - $(e.target).offset().top, false)
    });
    this.$canvas.mousemove((e) => {
        if (this.mousePressed && this.canDraw) {
            this.localDraw.call(this, e.clientX - $(e.target).offset().left, e.clientY - $(e.target).offset().top, true)
        }
    });
    this.$clearbtn.click((e) => {
        if (!(this.canDraw)) {
            return;
        }
        socket.emit(constant_data.MSG_TYPES.DRAW_CLEAR, false);
        this.clear();
    });
}

Canvas.prototype.joinRoomcb = function (ingameData) {
    this.clear();
    this.canDraw = false;
    if (ingameData === null) {
        return;
    }
    this.receivedStack = ingameData.picture;
    this.setNonDrawerInterval();
}
Canvas.prototype.startDrawing = function () {
    this.enable();
    this.setDrawerInterval();
}

Canvas.prototype.startHearing = function () {
    this.disable();
    this.setNonDrawerInterval();
}
Canvas.prototype.drawReceived = function (data) {
    this.receivedStack.push(data);
}

//handles the data received to create the output sent with the socket
Canvas.prototype.localDraw = function (x, y, isDown) {
    var output;
    if (isDown && this.state === 0) { //painting and is down
        output = { x, y, c: this.color, w: this.width };
    } else if (isDown && this.state === 1) { //erasing and is down
        output = { x, y, c: this.eraserColor, w: this.eraserWidth };
    } else if (!isDown && this.state === 2) {
        output = { x, y, c: this.color };
    }
    else { //painting / erasing and not down
        output = { x, y };
    }
    output.s = this.state;
    this.stack.push(output);
    this.executeDraw(output);
}

//executes draw command
Canvas.prototype.executeDraw = function (data) {
    switch (data.s) {
        case 0:
        case 1:
            this.paint(data);
            break;
        case 2:
            console.log(data);
            this.floodfill(data);
            break;
    }
}

//changes the canvas cursor
Canvas.prototype.changeCursor = function (newCursor) {
    this.$canvas.removeClass(this.cursor);
    this.$canvas.addClass(newCursor);
    this.cursor = newCursor;
}
Canvas.prototype.paint = function (data) { //socketDraw
    if (!data.x || !data.y) {
        return;
    }
    if (data.hasOwnProperty('c')) { //if the object doesn't have this property than isDown is false
        this.ctx.beginPath();
        this.ctx.strokeStyle = data.c;
        this.ctx.lineWidth = data.w;
        this.ctx.lineJoin = "round";
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(data.x, data.y);
        this.ctx.closePath();
        this.ctx.stroke();

    }
    this.lastX = data.x; this.lastY = data.y;
}

//Flood fill implementation
//Self implemented and maybe will be revisited later if underperformant
//use depth first search (since javascript pop is a lot better than shift)
//also with help from https://stackoverflow.com/questions/2106995/how-can-i-perform-flood-fill-with-html-canvas with few tweaks
Canvas.prototype.floodfill = function (data) {
    //{ x, y, c: this.color}
    if (!data.c) {
        return;
    }
    let color = data.c;
    let initx = Math.floor(data.x); 
    let inity = Math.floor(data.y);
    let width = this.$canvas[0].width;
    let height = this.$canvas[0].height;
    var imageData = this.ctx.getImageData(0, 0, width, height);
    //let visited = new Uint8Array(imageData.width * imageData.height); // tracks visited nodes
    let pixelStack = [];
    const desiredcolor = this.HexToColor(color); //get array of colors from hex / this is the color we want to have, it will overwrite target color
    const targetColor = this.getPixel(imageData, (inity * imageData.width + initx) * 4); // the color we'll replace

    if (this.compareColors(targetColor, desiredcolor, 1)) { //if same color we return since we will change nothing (pixel filled has same color at our chosen color)
        return;
    }

    pixelStack.push(initx, inity); // we add initial point

    while (pixelStack.length > 0) {
        //get coordinates
        const y = pixelStack.pop();
        const x = pixelStack.pop();

        let offset = (y * imageData.width + x) * 4; //offset for visited => *4 for pixels (since each pîxel has rgba)
       /* if (offset < 0 || offset > visited.length || visited[offset]){
            continue;
        }
        visited[offset] = 1; //ok we visited now
        offset *= 4; // we adjust our offset for future usage
        */
       if (offset < 0){
           continue;
       }
        let pixelColor = this.getPixel(imageData, offset); // we get the color
        if (!pixelColor || !this.compareColors(pixelColor, targetColor, 1)) { //the pixel color is different from the target color we want to overwrite so we move on
            continue;
        }

        this.setPixel(imageData, offset, desiredcolor); // we set the pixel color

        //we add it's neighbours
        
        pixelStack.push(x + 1, y);
        pixelStack.push(x - 1, y);
        pixelStack.push(x, y + 1);
        pixelStack.push(x, y - 1);
    }

    this.ctx.putImageData(imageData, 0, 0); // we put the new image, with filled in
}

Canvas.prototype.getPixel = function (imageData, offset) {
    if (offset < 0 || offset > imageData.data.length) {
        return null;  // impossible color
    } else {
        return imageData.data.slice(offset, offset + 4);
    }
}

Canvas.prototype.setPixel = function (imageData, offset, color) {
    imageData.data[offset + 0] = color[0];
    imageData.data[offset + 1] = color[1];
    imageData.data[offset + 2] = color[2];
    imageData.data[offset + 3] = 255;
}

Canvas.prototype.compareColors = function (a, b, tolerance) {
    if (a === null)
        return false;
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return dr * dr + dg * dg + db * db < tolerance;
}

//Transforms color hex to array for rgb values
//taken from : https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
Canvas.prototype.HexToColor = function (colorHex) {
    return colorHex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        , (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))
}

Canvas.prototype.setDrawerInterval = function () { //for drawer sending packets
    if (this.intervalObj !== null) {
        clearInterval(this.intervalObj);
    }

    this.intervalObj = setInterval((function (self) {
        if (self.stack.length !== 0) {
            if (self.stack.length > 8) {
                var rest = self.stack.splice(8);
                socket.emit(constant_data.MSG_TYPES.DRAW, false, self.stack);
                self.stack = rest;
            } else {
                socket.emit(constant_data.MSG_TYPES.DRAW, false, self.stack);
                self.stack = [];
            }
        }
    }), this.sendInterval, this);
}

Canvas.prototype.setNonDrawerInterval = function () { //for non drawer receiving packets
    if (this.intervalObj !== null) {
        clearInterval(this.intervalObj);
    }
    this.intervalObj = setInterval((function (self) {
        if (self.receivedStack.length !== 0) {
            self.executeDraw.call(self, self.receivedStack.shift()[0]);
        }
    }), 5, this);
}

Canvas.prototype.enable = function () {
    this.canDraw = true;
}

Canvas.prototype.disable = function () {
    this.canDraw = false;
}
Canvas.prototype.clear = function () {
    this.stack = [];
    this.receivedStack = [];
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
}

this.canvas = new Canvas();

//TODO : Disable buttons