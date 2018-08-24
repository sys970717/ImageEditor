var IMAGE_EDITOR = IMAGE_EDITOR || {};

var toggleBox = function(elementId, condition) {
    switch(condition) {
        case "open" : 
            $("#"+elementId).removeClass('close');
            break;
        case "close" : 
            $("#"+elementId).addClass('close');
            break;
    }
}

var manageState = function(eventName) {
    if(IMAGE_EDITOR.state.condition === true){
        return;
    } else {
        IMAGE_EDITOR.state.condition = true;
        IMAGE_EDITOR.state.setStateLog(eventName);
    }
}

IMAGE_EDITOR.pos = {
    __pos1 : 0,
    __pos2 : 0,
    __pos3 : 0,
    __pos4 : 0
}

IMAGE_EDITOR.events = {
    crop : {
        open : function() {
            if(IMAGE_EDITOR.state.condition) {
                alert("잘라내기 기능을 사용중입니다.");
                return;
            } else {
                $("#toolBox").addClass('crop_box');
                toggleBox('toolBox', 'open');
                manageState("crop");
                $("#toolBox").on("mousedown", this.move);
            }
        },
        move : function(e) {
            if(e.type === "mousedown") {
                var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                e = e || widnow.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                IMAGE_EDITOR.pos.__pos3 = e.clientX;
                IMAGE_EDITOR.pos.__pos4 = e.clientY;

                $(IMAGE_EDITOR.object.getObject()).on("mousemove", function(e) {
                    e = e || window.event;
                    e.preventDefault();
                    this.pos1 = this.pos3 - e.clientX;
                    this.pos2 = this.pos4 - e.clientY;
                    this.pos3 = e.clientX;
                    this.pos4 = e.clientY;

                    console.log("pos1 : "+pos1+" pos2 : "+pos2+" pos3 : "+pos3+" pos4 : "+pos4);
    
                    $(".crop_box").attr("style", "top : "+$(".crop_box")[0].offsetTop - this.pos2+"px; left : "+$(".crop_box")[0].offsetLeft - this.pos1+"px;");
                });

                $("#toolBox").on("mouseup", function() {
                    $(IMAGE_EDITOR.object.getObject()).off("onmousemove");
                    document.getElementById("toolBox").onmouseup = null;
                });
            }
        },

        cut : function() {

        },
        cancel : function() {

        }
    },
    handleDrop : function(files){
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

    __fileUpload : function(file, size) {
        var fileReader = new FileReader;
        fileReader.onload = function() {
            var image = new Image();
            image.onload = function(){
                var canvas = document.getElementById("canvas");
               
                if(image.width > size) {
                    image.height *= size / image.width;
                    image.width = size;
                }
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
            };
            image.src = this.result;
        }
        fileReader.readAsDataURL(file);
    }
};

// 에디터 기능 상태관리 ( 다른 툴을 이용하여 편집 중 충돌이 생기지 않도록 한다. )
IMAGE_EDITOR.state = {
    condition : false,
    stateLog : [],
    setStateLog : function(eventName) {
        if(this.stateLog.length >= 20) {
            //TODO : 배열 한칸씩 오른쪽으로 밀기
        } else {
            //TODO : History 담기
            this.stateLog.push(eventName);
        }
    },
    getStateLog : function() {
        return this.stateLog.Array.prototype.slice(0);
    }
};

IMAGE_EDITOR.object = {
    __object : "",
    setObject : function(elementId) {
        this.__object = document.getElementById(elementId) === undefined ? document.getElementsByTagName('canvas')[0] : document.getElementById(elementId);
    },

    getObject : function() {
        return this.__object;
    },

    getWidth : function() {
        return this.__object.getAttribute("width") === undefined || this.__object.getAttribute("width") < 200 ? 500 : this.__object.getAttribute("width");
    },

    getHeight : function() {
        return this.__object.getAttribute("height") === undefined ? 500 : this.__object.getAttribute("height");
    }
}

var init = function(elementId) {
    IMAGE_EDITOR.object.setObject(elementId);

    $("#fileUpload").on("change", function(event) {
        IMAGE_EDITOR.events.handleDrop(event.target.files)
    });
    
    $("#crop_open").on("click", function() {
        IMAGE_EDITOR.events.crop.open();
    });
}