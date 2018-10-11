var state = {
    degrees: 0,
    origin: '',
    image_width: 0,
    image_height: 0,
    extract: '',
    stickerIndex: 0,
    sticker: []
}

var props = {
    MAX_BYTE: 100000000,
    ACCEPTED_FILE_TYPES: 'image/jpeg, image/jpg, image/png',
    width: 500,
    height: 500,
}

var mouse = {
    mouseX: 0,
    mouseY: 0,
    sizeX: 0,
    sizeY: 0,
    posX: 0,
    posY: 0,
}

var canvas, ctx

var init = function () {
    canvas = document.getElementById('editor'), ctx = canvas.getContext('2d')
    canvas.width = props.width, canvas.height = props.width
    document.getElementById('fileUpload').addEventListener('change', handleUpload, false)
}

var handleUpload = function (e) {
    var files = e.target.files
    if (varifyImage(files)) {
        var file = files[0]

        var fileReader = new FileReader()
        fileReader.readAsDataURL(file)

        fileReader.onload = function () {
            var image = new Image()
            state.extract = extractImageFileExtensionFromBase64(this.result)
            image.src = this.result

            image.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                var rw = image.width / props.width, rh = image.height / props.width
                var editWidth, editHeight

                if (rw > rh) {
                    editWidth = props.width
                    editHeight = Math.round(image.height / rw)
                } else {
                    editWidth = Math.round(image.width / rh)
                    editHeight = props.width
                }

                state.image_width = editWidth, state.image_height = editHeight

                ctx.drawImage(image, 0, 0, editWidth, editHeight)
            }
        }
    } else {
        return
    }
}

var handleCropButton = function () {
    var wrapper = document.getElementById('crop_wrapper')
    $("#crop_wrapper").removeClass('off')
    wrapper.setAttribute(
        'style', 'left:' + canvas.offsetLeft + 'px;' +
        'top:' + canvas.offsetTop + 'px;'
    )
}

var handleResizeCropBox = function (event) {
    mouse.sizeX = event.pageX;
    mouse.sizeY = event.pageY;
    var target = event.target
    var prev = $(target).prev()

    $("#wrapper").on('mousemove', function (e) {
        _checkedSizePosition($(target), prev, e)
    })

    $(target).on('mouseup', function (e) {
        $("#wrapper").off('mousemove');
        target.mousedown = null
        return false
    })
}

var handleMoveCropBox = function (event) {
    mouse.mouseX = event.pageX
    mouse.mouseY = event.pageY

    var target = event.target
    var parent = $(target).parent()

    $("#wrapper").on('mousemove', function (e) {
        _checkedMovePosition(parent, e)

    })

    $(target).on('mouseup', function (e) {
        $("#wrapper").off('mousemove');
        target.mousedown = null
        return false
    })
}

var drawCrop = function () {
    var cropBox = $("#overlay")
    var wrapBox = $('#crop_wrapper').offset()

    var image = new Image()
    image.src = canvas.toDataURL()

    image.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var sx = wrapBox.left, sy = wrapBox.top
        var sWidth = cropBox.width(), sHeight = cropBox.height()

        ctx.drawImage(image, sx, sy, sWidth, sHeight, sx, sy, sWidth, sHeight)
    }
}
/*
 * Image Rotate
 * @Param [String] direction
 */
var handleRotate = function (direction) {
    if (direction === 'left') {
        state.degrees = 90
    } else {
        state.degrees = 270
    }

    var ox = (props.width / 2), oy = (props.width / 2)

    ctx.save()
    ctx.translate(ox, oy)
    ctx.rotate((Math.PI / 180) * state.degrees)
    ctx.globalCompositeOperation = "copy"

    // returnData = {width : '', height: ''}
    ctx.translate(-ox, -oy)
    ctx.drawImage(ctx.canvas, 0, 0, props.width, props.width)
    ctx.restore()
}

// Sticker Event
var handleSticker = {
    create: function (ele) {
        var sticker = ele.childNodes[0].src;
        createStickerController(sticker)
    },
    resize: function (event) {
        mouse.sizeX = event.pageX;
        mouse.sizeY = event.pageY;
        var target = event.target
        var prev = $(target).prev()

        $("#wrapper").on('mousemove', function (e) {
            _checkedSizePosition($(target), prev, e)
        })

        $(target).on('mouseup', function (e) {
            $("#wrapper").off('mousemove');
            target.mousedown = null
            return false
        })
    },
    drag: function (event) {
        mouse.mouseX = event.pageX
        mouse.mouseY = event.pageY

        var target = event.target
        var parent = $(target).parent()

        $("#wrapper").on('mousemove', function (e) {
            _checkedMovePosition(parent, e)

        })

        $(target).on('mouseup', function (e) {
            $("#wrapper").off('mousemove');
            target.mousedown = null
            return false
        })
    }
}

var handleImageFlip = function (direction) {
    var ox = (props.width / 2), oy = (props.width / 2)

    ctx.save()
    ctx.translate(ox, oy)

    if (direction === "vertical") {
        ctx.scale(-1, 1)

    } else if (direction === "horizontal") {
        ctx.scale(1, -1)
    }

    ctx.globalCompositeOperation = "copy"

    // returnData = {width : '', height: ''}
    ctx.translate(-ox, -oy)
    ctx.drawImage(ctx.canvas, 0, 0, props.width, props.width)
    ctx.restore()
}

