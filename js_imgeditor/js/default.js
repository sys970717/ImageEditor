var IMAGE_EDITOR = IMAGE_EDITOR || {};
var mouseX = 0, mouseY = 0; // Mouse Event Position
var posX = 0, posY = 0; // div Box Position
var sizeX =0, sizeY = 0; // div Box Size

var toggleBox = function (elementId, condition) {
    switch (condition) {
        case "open":
            $("#" + elementId).removeClass('close');
            break;
        case "close":
            $("#" + elementId).addClass('close');
            break;
    }
}

var manageState = function (eventName) {
    if (IMAGE_EDITOR.state.condition === true) {
        IMAGE_EDITOR.state.condition = false;
        return;
    } else {
        IMAGE_EDITOR.state.condition = true;
        IMAGE_EDITOR.state.setStateLog(eventName);
    }
}

var elementDrag = function (e) {
    posX = mouseX - e.clientX;
    posY = mouseY - e.clientY;

    mouseX = e.clientX;
    mouseY = e.clientY;

    // Move position Data
    var moveX = 0, moveY = 0;
    // container position data
    var container = IMAGE_EDITOR.object;
    var containerX = container.getObject().offsetLeft;
    var containerY = container.getObject().offsetTop;

    var target = $("#wrapBox");

    // crop box control div in container;
    // if using jquery offset, don't behavior you wants
    if (containerX >= target.position().left - posX) {
        moveX = containerX;
    } else if (container.getWidth() <= ((target.position().left - posX) + target.width())) {
        moveX = container.getWidth()
    } else {
        moveX = target.position().left - posX;
    }

    if (containerY >= target.position().top - posY) {
        moveY = containerY;
    } else if (container.getHeight() <= ((target.position().top - posY) + target.height())) {
        moveY = container.getHeight();
    } else {
        moveY = target.position().top - posY;
    }

    target.css({
        top: moveY,
        left: moveX
    });
}

var elementResize = function(obj, e) {
    // Move Size Data
    var moveX = 0, moveY = 0;
    // container size data
    var container = IMAGE_EDITOR.object;
    var containerX = container.getWidth()
    var containerY = container.getHeight();

    var target = $(obj).prev();
    console.log($(obj).prev());

    moveX = parseInt(target.css('width'))-(sizeX - e.pageX);
    moveY = parseInt(target.css('height'))-(sizeY - e.pageY);

    console.log("SMX : "+ (sizeX - e.pageX) + " \t SMY : "+ (sizeY - e.pageY));

	sizeX = e.pageX;
    sizeY = e.pageY;

    console.log("SX : "+ sizeX + " \t SY : "+ sizeY);
    console.log("SMX : "+ (sizeX - e.pageX) + " \t SMY : "+ (sizeY - e.pageY));
    console.log("MX : "+ moveX + " \t MY : "+ moveY);

    if(containerX < moveX){
        target.css({'width':containerX, 'height': moveY});
    } else if(containerY < moveY) {
        target.css({'width':moveX, 'height': containerY});
    } else {
        target.css({'width':moveX, 'height': moveY});
    };
    return;
}

IMAGE_EDITOR.events = {
    handleDrop: function (files) {
        // Multiple files can be dropped. Lets only deal with the "first" one.
        var file = files[0];
        // Image check
        if (file.type.match('image.*')) {
            // call function to draw canvas
            try {
                IMAGE_EDITOR.events.__fileUpload(file, IMAGE_EDITOR.object.getWidth());
            } catch (err) {
                alert("Error : Undefined Canvas tag \n Solution : Check definition canvas tag on your html");
                return;
            }

        } else {
            alert("That file wasn't an image.");
        }
    },

    __fileUpload: function (file, size) {
        var fileReader = new FileReader;
        fileReader.onload = function () {
            var image = new Image();
            image.onload = function () {
                var canvas = document.getElementById("canvas");

                if (image.width > size) {
                    image.height *= size / image.width;
                    image.width = size;
                }
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;

                $("#div_view").css({
                    width: canvas.width + 'px',
                    height: canvas.height + 'px',
                    top: canvas.offsetTop + 'px',
                    left: canvas.offsetLeft + 'px'
                });
                $("#crop_preview").css({ width: image.width, height: image.height });
                ctx.drawImage(image, 0, 0, image.width, image.height);
            };
            image.src = this.result;
            IMAGE_EDITOR.object.setOriginal(this.result);
        }
        fileReader.readAsDataURL(file);
        IMAGE_EDITOR.state.setStateLog("upload");
    }
};

IMAGE_EDITOR.events.crop = {
    open: function () {
        if (IMAGE_EDITOR.state.condition) {
            alert("잘라내기 기능을 사용중입니다.");
            return;
        } else {
            $("#wrapBox").addClass('crop_box');
            toggleBox('wrapBox', 'open');
            manageState("crop");
            createCropBox();

            $("#overlay").on("mousedown", function () {
                mouseX = event.clientX;
                mouseY = event.clientY;

                $(IMAGE_EDITOR.object.getBoxObj()).on("mousemove", elementDrag);
            });

            $("#overlay").on("dblclick", IMAGE_EDITOR.events.crop.cut);

            $(document).on("mouseup", function () {
                $("#overlay").off("mouseup", this);
                document.getElementById("overlay").onmouseup = null;
                // all event stop
                $(IMAGE_EDITOR.object.getBoxObj()).off("mousemove", elementDrag);
            });
        }
    },

    cut: function (e) {
        var cropBox = $("#wrapBox");
        var canvas = IMAGE_EDITOR.object.getObject();
        var ctx = canvas.getContext('2d');

        var imageData = canvas.toDataURL();
        var image = new Image();
        image.src = imageData;

        image.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var srcX = parseInt(cropBox.position().left),
                srcY = parseInt(cropBox.position().top),
                srcWidth = parseInt(cropBox.width()),
                srcHeight = parseInt(cropBox.height());

            ctx.drawImage(image, srcX, srcY, 0, 0, srcX, srcY, srcWidth, srcHeight);
        }

        this.cancel;
    },

    cancel: function () {
        $("#wrapBox").removeClass('crop_box');
        toggleBox('wrapBox', 'close');
        manageState("crop");
    }
};

IMAGE_EDITOR.events.resizingBox = {
    action: function (event) {
        var target = event.target;
        
        sizeX = $("#overlay").width();
        sizeY = $("#overlay").height();

        $("#image_view").on('mousemove', function(event){
            IMAGE_EDITOR.events.resizingBox.resize(target, event);
        });

        $(document).on('mouseup', this.cancel);
    },

    resize: function(obj, e) {
        elementResize(obj, e);
    },

    cancel: function (event) { 
        event.preventDefault();
        console.log(event);
        $(event.target).off('mousedown mouseup', null);

    }
};

// 에디터 기능 상태관리 ( 다른 툴을 이용하여 편집 중 충돌이 생기지 않도록 한다. )
IMAGE_EDITOR.state = {
    condition: false,
    __canvasLog: [],
    stateLog: [],
    setStateLog: function (eventName) {
        if (this.stateLog.length >= 20) {
            this.stateLog.splice(0, 1);
        }

        //TODO : History 담기
        this.stateLog.push(eventName);
    },
    getStateLog: function () {
        return this.stateLog.Array.prototype.slice(0, 1);
    },

    setCanvasLog: function (data) {
        if (this.__canvasLog.length >= 20) {
            this.stateLog.splice(0, 1);
        }
        //TODO : History 담기
        this.__canvasLog.push(data);
    },

    getCanvasLog: function () {
        var canvasLog = this.__canvasLog.length;
        var returnData = this.__canvasLog.Array.prototype.slice(canvasLog - 1, canvasLog);
        returnData.splice(canvasLog - 1, 1);
        return this.returnData;
    }
};

/*
 * 에디터 object관리
 */
IMAGE_EDITOR.object = {
    __object: "",
    __origin: {},
    setObject: function (elementId) {
        this.__object = document.getElementById(elementId) === undefined ? document.getElementsByTagName('canvas')[0] : document.getElementById(elementId);
    },

    getObject: function () {
        return this.__object;
    },

    getWidth: function () {
        return this.__object.getAttribute("width") === undefined || this.__object.getAttribute("width") < 200 ? 500 : this.__object.getAttribute("width");
    },

    getHeight: function () {
        return this.__object.getAttribute("height") === undefined ? 500 : this.__object.getAttribute("height");
    },

    getBoxObj: function () {
        return document.getElementById('overlay');
    },

    setOriginal: function (data) {
        this.__origin = data;
    },

    getOriginal: function () {
        return this.__origin;
    }
}

var init = function (elementId) {
    IMAGE_EDITOR.object.setObject(elementId);

    $("#fileUpload").on("change", function (event) {
        IMAGE_EDITOR.events.handleDrop(event.target.files)
    });

    $("#crop_open").on("click", function () {
        IMAGE_EDITOR.events.crop.open();
    });
}
/*
 * cropBox 만들기
 */
var createCropBox = function () {
    var wrapping = document.createElement('div');
    var overlay = document.createElement('div');
    var resizeOverlay = document.createElement('div');
    var cropButton = document.createElement('button');

    wrapping.setAttribute('class', 'wrapBox');
    wrapping.setAttribute('style', 'border: 1px solid #39f;');
    wrapping.setAttribute('id', 'wrapBox');

    overlay.setAttribute('id', 'overlay');
	overlay.style.width = parseInt(canvas.width)/2+'px';
	overlay.style.height = parseInt(canvas.height)/2+'px';

    resizeOverlay.setAttribute('class', 'resize-handle-se');
    resizeOverlay.setAttribute('onmousedown', 'javascript:IMAGE_EDITOR.events.resizingBox.action(event);')

    cropButton.setAttribute('type', 'button');
    cropButton.innerHTML = 'Crop';

    document.getElementById('image_view').appendChild(wrapping);

    wrapping.appendChild(cropButton);
    wrapping.appendChild(overlay);
    wrapping.appendChild(resizeOverlay);
}