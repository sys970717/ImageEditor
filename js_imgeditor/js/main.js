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
            }
        },
        move : function() {
            
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
            IMAGE_EDITOR.events.__fileUpload(file, 1000);
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

var init = function() {
    $("#fileUpload").on("change", function(event) {
        IMAGE_EDITOR.events.handleDrop(event.target.files)
    });
    
    $("#crop_open").on("click", function() {
        IMAGE_EDITOR.events.crop.open();
    });
}