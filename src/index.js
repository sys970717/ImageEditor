/*
 * 편집기 상태관리를 위해 선언한 Object
 * @since 2018. 10. 15
 * @author sys970717
 * Type Object
 */
var state = {
    degrees: 0,
    origin: '',
    image_width: 0,
    image_height: 0,
    event_state : false,
    evnet_name : '',
    extract: '',
    stickerIndex: 0,
    sticker: [],
    scale_count : 1,
    view_original : 1.0,
    scale : {
        edit : 1.0,
        Multiplier : 0.92
    },
    ctx_original : ''
}

/*
 * 이미지 데이터에 대한 정의 및 canvas 에 대한 고정 크기 정의
 * @since 2018. 10. 15
 * @author sys970717
 * Type Object
 */
var props = {
    MAX_BYTE: 100000000,
    ACCEPTED_FILE_TYPES: 'image/jpeg, image/jpg, image/png',
    width: 500,
    height: 500,
    MAX_SCALE : 5,
    MIN_SCALE : 0
}

/*
 * 마우스 액션 이벤트에 대한 계산에 필요하여 선언함.
 * @since 2018. 10. 15
 * @author sys970717
 * Type Object
 */
var mouse = {
    mouseX: 0,
    mouseY: 0,
    sizeX: 0,
    sizeY: 0,
    posX: 0,
    posY: 0,
}

// history_arr
var history_arr = {
    _arr : [],
    _tmp_arr : [],
    getArr : function() {
        return this._tmp_arr[this._arr.length-1]
    },
    setArr : function(data) {
        this._arr.push(data)
        this._tmp_arr = this._arr
    }
}

var canvas, ctx, tmp_image

/*
 * 페이지 인입시 초기화하는 메서드
 * @Type Method
 * @since 2018. 10. 15
 * @author sys970717
 */
var init = function () {
    canvas = document.getElementById('editor'), ctx = canvas.getContext('2d')
    canvas.width = props.width, canvas.height = props.width
    document.getElementById('fileUpload').addEventListener('change', handleUpload, false)
    tmp_image = document.getElementById('tmp_image')
    // ctx.globalCompositeOperation = "copy"
}

/*
 * 이미지 파일 업로드시 발생 이벤트 메서드
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 * @Param Event
 */
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
            state.origin = this.result

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

                tmp_image.width = state.image_width
                tmp_image.height = state.image_height
                tmp_image.src = this.src
            }
            history_arr.setArr(image)
            state.ctx_original = ctx.getImageData(0, 0, state.image_width, state.image_height)
        }
    } else {
        return
    }
}

/*
 * 잘라내기 버튼 클릭시 발생 이벤트 메서드
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 */
var handleCropButton = function () {
    if(state.event_state) {
        alert('다른 이벤트를 사용중입니다.')
        return
    }
    var wrapper = document.getElementById('crop_wrapper')
    $("#crop_wrapper").removeClass('off')
    wrapper.setAttribute(
        'style', 'left:' + canvas.offsetLeft + 'px;' +
        'top:' + canvas.offsetTop + 'px;'
    )
    state.event_state = true
}

/*
 * 잘라내기 하는 crop box 리사이징 할 때 불러오는 메서드
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 * @Param Event
 */
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

/*
 * 잘라내기 하는 crop box 움직일 때 불러오는 메서드
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 * @Param Event
 */
var handleMoveCropBox = function (event) {
    mouse.mouseX = event.pageX
    mouse.mouseY = event.pageY

    var target = event.target
    var parent = $(target).parent()

    $("#wrapper").on('mousemove', function (e) {
        _checkedMovePosition($(target), parent, e)

    })

    $(target).on('mouseup', function (e) {
        $("#wrapper").off('mousemove');
        target.mousedown = null
        return false
    })
}

/*
 * 이미지 잘라내기
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 */
var drawCrop = function () {
    var cropBox = $("#overlay")
    var wrapBox = $('#crop_wrapper').offset()

    ctx.save()
    var image = new Image()
    image.src = document.getElementById('editor').toDataURL()

    image.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        var sx = wrapBox.left - canvas.offsetTop < 0 ? 0 :wrapBox.left - canvas.offsetTop , sy = wrapBox.top - canvas.offsetTop < 0 ? 0 : wrapBox.top - canvas.offsetTop
        var sWidth = cropBox.width(), sHeight = cropBox.height()

        ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)
    }

    state.ctx_original = ctx.getImageData(0, 0, state.image_width, state.image_height)
    history_arr.setArr(image)
    state.event_state = false
    $("#crop_wrapper").addClass('off')
    
}
/*
 * Image Rotate
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 * @Param String [방향]
 */
var handleRotate = function (direction) {
    if (direction === 'left') {
        state.degrees = 90
    } else {
        state.degrees = 270
    }

    var ox = (props.width / 2), oy = (props.height / 2)

    ctx.save()
    ctx.translate(ox, oy)
    ctx.rotate((Math.PI / 180) * state.degrees)
    ctx.globalCompositeOperation = "copy"

    // returnData = {width : '', height: ''}
    ctx.translate(-ox, -oy)
    ctx.drawImage(ctx.canvas, 0, 0, props.width, props.height)
    ctx.restore()
    state.ctx_original = ctx.getImageData(0, 0, state.image_width, state.image_height)
}

// Sticker Event
var handleSticker = {
    create: function (ele) {
        if(state.event_state === false) {
            state.event_state = true
            state.evnet_name = 'sticker'
            var sticker = ele.childNodes[0].src;
            createStickerController(sticker)
        } else if(state.evnet_name === 'sticker') {
            var sticker = ele.childNodes[0].src;
            createStickerController(sticker)
        } else {
            alert('이벤트가 실행되고있습니다. 현재 상태를 저장 후 사용하시기 바랍니다.')
            return;
        }
        
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
            _checkedMovePosition($(target), parent, e)

        })

        $(target).on('mouseup', function (e) {
            $("#wrapper").off('mousemove');
            target.mousedown = null
            return false
        })
    },
    render : function() {
        var stickerController, stickerObj, image = new Image()
        var s_left = 0, s_top = 0, sticker_width = 0, sticker_height = 0
        ctx.save()
        for(var i=1; i<=state.stickerIndex; i++) {
            stickerController = document.getElementById('sticker_wrap_'+i)
            stickerObj = document.getElementById('image_sticker_'+i)
            
            image.src = stickerObj.src
            
            s_left = Math.round(stickerController.offsetLeft - canvas.offsetLeft),
            s_top = Math.round(stickerController.offsetTop - canvas.offsetTop)

            sticker_width = stickerObj.width, sticker_height = stickerObj.height
            
            ctx.drawImage(image, s_left, s_top, sticker_width, sticker_height)
            ctx.restore()

            $(stickerObj).remove()
            $(stickerController).remove()
        }
        state.sticker = []
        state.stickerIndex = 0
        state.event_state = false
        state.evnet_name = ''
        state.ctx_original = ctx.getImageData(0, 0, state.image_width, state.image_height)
        tmp_image.src = canvas.toDataURL()
    }
}

/*
 * Canvas 상하 반전, 좌우 반전을 위한 메서드
 * @since 2018. 10. 15
 * @author sys970717
 * @Type Method
 * @Param String [방향]
 */
var handleImageFlip = function (direction) {
    var ox = (props.width / 2), oy = (props.height / 2)

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
    state.ctx_original = ctx.getImageData(0, 0, state.image_width, state.image_height)
    return
}

var handleZoom = {
    in : function() {
        var ox = (props.width / 2), oy = (props.height / 2)
        var max = props.MAX_SCALE
        if(max > state.scale_count) {
            state.scale_count += 1
            state.scale.edit /= state.scale.Multiplier
            this._render()
        }
    },
    out : function() {
        var min = props.MIN_SCALE
        if(min < state.scale_count) {
            state.scale_count -= 1
            state.scale.edit *= state.scale.Multiplier
            this._render()
        }
    },
    _render : function() {    
        var ox = (props.width / 2), oy = (props.height / 2)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.translate(ox, oy);
        ctx.scale(state.scale.edit, state.scale.edit)
        // ctx.translate(-ox, -oy);

        ctx.clearRect(0, 0, props.width, props.height);

        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        // ctx.clearRect(0, 0, props.width, props.height)

        ctx.restore()

        var image = new Image()
        image.src = history_arr.getArr().src

        var data = getScaleSize(image.width, image.height)

        ctx.drawImage(image, 0, 0, data.width, data.height)
        return
    }
}

var handleFilter = function(data) {
    Filter.factory(data)
}

