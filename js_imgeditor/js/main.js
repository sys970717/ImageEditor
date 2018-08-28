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
                document.getElementById('toolBox').onmousedown = this.move;
            }
        },
        move : function(e) {
            e = e || widnow.event;
            e.preventDefault();
           
            if(e.type === "mousedown") {
                $(IMAGE_EDITOR.object.getBoxObj()).on("mousemove", function(e) {
                    e = window.event;
                    e.preventDefault();
                    if(e.clientX < $(IMAGE_EDITOR.object.getBoxObj()).offset().left) {

                    } else if(e.clientX > $(IMAGE_EDITOR.object.getBoxObj()).prop('width')) {

                    } else if(e.clientY < $(IMAGE_EDITOR.object.getBoxObj()).offset().top) {

                    } else if(e.clientY > $(IMAGE_EDITOR.object.getBoxObj()).prop('height')) {
                        
                    }

                    console.log("CLIENT : " +e.clientX + " \t "+e.clientY);
                    console.log("PAGE : " +e.pageX + " \t "+e.pageY);

                    $(".crop_box").attr("style", "top : "+(e.pageY)+"px; left : "+(e.pageX)+"px;");
                });

                $(document).on("mouseup", function() {
                    document.getElementById("toolBox").onmouseup = null;
                    // all event stop
                    $(IMAGE_EDITOR.object.getBoxObj()).off("mousemove", this.move);
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

                $("#div_view").css({
                    width : canvas.width+'px',
                    height : canvas.height+'px',
                    top : canvas.offsetTop+'px',
                    left : canvas.offsetLeft+'px'
                });

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
    },

    getBoxObj : function() {
        return document.getElementById('div_view');
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