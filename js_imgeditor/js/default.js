var handleDrop = function(files){
    var file = files[0]; // Multiple files can be dropped. Lets only deal with the "first" one.
    if (file.type.match('image.*')) {
        resizeImage(file, 1000);
    } else {
        alert("That file wasn't an image.");
    }
}

var fileUpload = function(file, size) {
    var fileTracker = new FileReader;
    fileTracker.onload = function() {
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
    fileTracker.readAsDataURL(file);
}

var init = function() {
    $("#fileUpload").on("change", function(event) {
        handleDrop(event.target.files)
    });
}