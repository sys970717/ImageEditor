var varifyImage = function (files) {
    if (files && files.length > 0) {
        var currentFile = files[0]
        var currentFileSize = currentFile.size

        if (currentFileSize > state.MAX_BYTE) {
            alert("This file is now allowed " + currentFileSize + "bytes is too large")
            return false
        } else {
            return true
        }
    }
}

var getScaleSize = function (width, height) {
    var rw = width / state.width, rh = height / state.height
    var editWidth, editHeight

    if (rw > rh) {
        editWidth = state.width
        editHeight = Math.round(height / rw)
    } else {
        editWidth = Math.round(width / rh)
        editHeight = state.height
    }

    var returnData = {
        width: editWidth,
        height: editHeight
    }

    return returnData
}

// JQuery Object 를 넘긴다.
var _checkedMovePosition = function (target, parent, e) {
    var containerY = canvas.offsetTop, containerX = canvas.offsetLeft
    var width = state.image_width
    var height = state.image_height
    var pos_x = (mouse.mouseX - e.pageX), pos_y = (mouse.mouseY - e.pageY)

    mouse.mouseX = e.pageX, mouse.mouseY = e.pageY
    var r_top = 0, r_left = 0

    console.log('Y : '+Math.round(((parent.position().top - pos_y)) + target.height()))
    console.log('Y : '+Math.round ((containerY+height) - target.height()))

    if (containerX >= parent.position().left - pos_x) {
        r_left = containerX
    } else if ( Math.round((containerX + width) - target.width()) <= (parent.position().left - pos_x)) {
        r_left = (containerX + width) - target.width()
    } else {
        r_left = parent.position().left - pos_x
    }

    if (containerY >= parent.position().top - pos_y) {
        r_top = containerY
    } else if ( Math.round((containerY+height) - target.height()) <= (parent.position().top - pos_y) ) {
        r_top = (containerY + height) - target.height();
    } else {
        r_top = parent.position().top - pos_y
    }

    return parent.css({ 'left': r_left, 'top': r_top });
}

// JQuery Object 를 넘긴다.
var _checkedSizePosition = function (target, result, e) {
    var containerY = state.image_height, containerX = state.image_width
    var moveX = 0, moveY = 0

    moveX = parseInt(result.css('width'))-(mouse.sizeX - e.pageX)
    moveY = parseInt(result.css('height'))-(mouse.sizeY - e.pageY)

    console.log(moveX, moveY)

    mouse.sizeX = e.pageX
    mouse.sizeY = e.pageY

    if(containerX < moveX){
        result.css({'width':containerX, 'height': moveY})
    } else if(containerY < moveY) {
        result.css({'width':moveX, 'height': containerY})
    } else {
        result.css({'width':moveX, 'height': moveY})
    }

    return
}

// Extract an Base64 Image's File Extension
var extractImageFileExtensionFromBase64 = function (base64Data) {
    return base64Data.substring('data:image/'.length, base64Data.indexOf(';base64'))
}

var createStickerController = function(src) {
    var container = canvas.parentNode
    var imgTag = document.createElement('img'),
    wrapper = document.createElement('div'),
    sizeDiv = document.createElement('div')

    state.stickerIndex += 1

    stickerIndex = state.stickerIndex
    state.sticker.push({stickerIndex : 'image_sticker'+stickerIndex})

    // Sticker Body
    imgTag.setAttribute('src', src)
    imgTag.setAttribute('class', 'image_stickers')
    imgTag.setAttribute('id', 'image_sticker_'+stickerIndex)
    imgTag.setAttribute('onmousedown', 'handleSticker.drag(event)')
    imgTag.setAttribute('crossOrigin', 'Anonymous')
    
    // Sticker Resize Handle
    sizeDiv.setAttribute('onmousedown', 'handleSticker.resize(event)')
    sizeDiv.setAttribute('class', 'resize-handle-se')

    console.log(sizeDiv)

    // Sticker Move
    wrapper.setAttribute('class', 'sticker_image')
    wrapper.setAttribute('id','sticker_wrap_'+stickerIndex)
    wrapper.setAttribute('style', 'left:'+$(canvas).offset().left+'px; top:'+$(canvas).offset().top+'px;')

    container.appendChild(wrapper)
    wrapper.appendChild(imgTag)
    wrapper.appendChild(sizeDiv)
    return
}