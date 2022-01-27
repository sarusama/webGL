let squareRotation = 0.0;

main();

function main() {
    const canvas = document.querySelector("#glcanvas");
    // 初始化WebGL上下文
    const gl = canvas.getContext("webgl");

    // 确认WebGL支持性
    if (!gl) {
        alert("无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。");
        return;
    }

    // 顶点位置
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    varying lowp vec4 vColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }`;

    // 片段着色器 确定像素的颜色
    const fsSource = `
    varying lowp vec4 vColor;
    
    void main() {
        gl_FragColor = vColor;
    }`;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
        }
    };

    let buffer = initBuffers(gl);

    requestAnimationFrame(render);

    function render() {
        drawScene(gl, programInfo, buffer);
        squareRotation += 0.01;
        squareRotation = squareRotation % 360;
        requestAnimationFrame(render);
    }

    // // 使用完全不透明的黑色清除所有图像
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // // 用上面指定的颜色清除缓冲区
    // gl.clear(gl.COLOR_BUFFER_BIT);
};


//  初始化着色器程序，让WebGL知道如何绘制我们的数据
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // 创建着色器程序

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // 创建失败， alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// 创建指定类型的着色器，上传source源码并编译
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    let vertices = [
        1.0, 1.0, 0.0, // 右上 x, y, z
        -1.0, 1.0, 0.0, // 左上 x, y, z
        1.0, -1.0, 0.0, // 右下 x, y, z
        -1.0, -1.0, 0.0, // 左下 x, y, z
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Convert the array of colors into a table for all the vertices.

    var colors = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer
    };
}

function drawScene(gl, programInfo, buffers) {
    // 背景
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [0.0, 0.0, -6.0]);  // amount to translate

    // 旋转 x, y, z, 旋转中心点
    // mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 0, 1]);
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }
    
    // Tell WebGL to use our program when drawing
  
    gl.useProgram(programInfo.program);
  
    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
  
    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

function normalize(min, max, value) {
    if (value < min) return min
    else if (value > max) return max
    else return value
}
  
function splitChannels(color, split) {
    color = color.replace(split, '').replace(')', '').trim()
  
    let channels = color.split(',')
  
    if (channels.length < 3 || channels.length > 4) {
        throw new Error(`${color} is not a valid rgb(a) color`)
    }
  
    return channels
}
  
function getChannels(color) {
    let alpha = false

    if (color.startsWith('r')) {
        if (color.startsWith(`rgba(`)) alpha = true
        else if (color.startsWith(`rgb(`)) alpha = false
    
        const split = alpha ? `rgba(` : `rgb(`
        return splitChannels(color, split)
    } else {
        throw new Error(`${color} is not a valid rgb(a) color`)
    }
}
  
function rgbToVec(color) {
    let channels = getChannels(color)
    channels = channels.map(c => parseFloat(c)).map(c => normalize(0, 255, c))
  
    let [r, g, b, a] = [0, 0, 0, 1];
  
    if (channels.length === 4) {
        [r, g, b, a] = channels;
    } else {
        [r, g, b, a = 1] = channels;
    }

    const rgb = [r, g, b].map(c => Math.round(c / 255 * 10) / 10)
    const alpha = normalize(0, 1, a)
  
    return `vec4(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}
