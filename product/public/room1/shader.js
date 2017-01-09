/**
 * Created by Li Bo on 2016/12/16.
 */

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying   vec2 v_TexCoord;
    uniform   mat4 u_MvpMatrix;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        v_TexCoord = a_TexCoord;
    }`;

const FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform bool u_UsingTexCoord;
    uniform bool u_Clicked;
    uniform vec4 u_Color;
    uniform bool u_LightOn;
    varying vec2 v_TexCoord;
    void main() {
    
        if (u_UsingTexCoord && !u_Clicked) {
            if (u_LightOn)
                gl_FragColor = texture2D(u_Sampler, v_TexCoord) * vec4(1.0, 1.0, 1.0, 1.0);
            else
                gl_FragColor = texture2D(u_Sampler, v_TexCoord) * vec4(0.1, 0.1, 0.1, 1.0);
        } else {
            gl_FragColor = u_Color;
        }
    }`;

let modelMatrix = new Matrix4();
let puzzleSolved = false;

let pictureContent = [3, 0, 1, 6, 4, 2, 7, 5, 8];
const pictureTranslateX = [-2.0, 0.0, 2.0, -2.0, 0.0, 2.0, -2.0, 0.0, 2.0];
const pictureTranslateY = [2.0, 2.0, 2.0, 0.0, 0.0, 0.0, -2.0, -2.0, -2.0];

let eye = [6.5, 0.0, 5.5];
let lookAt = [5.5, 0, 5.5];
let up = [0.0, 1.0, 0.0];

let mouseClick = false;
let chapter = 0;

let floorTexture = {};
let ceilingTexture = {};

let wallTexture;
let skyTexture;
let wall2Texture;

let qrTexture;
let problemTexture;

let doorBTexture;
let doorCTexture;

let blackTexture;

let lightOn = false;
let qrOn = false;

function main() {

    const canvas = document.getElementById('example');

    const gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    //create programs
    let program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!program) {
        console.log('Failed to initialize shaders.');
        return;
    }

    //get storage locations of attributes and uniform variables in program
    program.a_Position = gl.getAttribLocation(program, 'a_Position');
    program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
    program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    program.u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
    program.u_UsingTexCoord = gl.getUniformLocation(program, 'u_UsingTexCoord');
    program.u_Color = gl.getUniformLocation(program, 'u_Color');
    program.u_Clicked = gl.getUniformLocation(program, 'u_Clicked');
    program.u_LightOn = gl.getUniformLocation(program, 'u_LightOn');

    if (program.a_Position < 0 || program.a_TexCoord < 0 || !program.u_MvpMatrix || !program.u_Sampler ||
        !program.u_UsingTexCoord || !program.u_Color || !program.u_Clicked) {
        console.log('Failed to get the storage location of attribute or uniform variable');
        return;
    }

    //set vertex imformation
    const cube = initVertexBuffers(gl);
    if (!cube) {
        console.log('Failed to set the vertex information');
        return;
    }

    //load texture
    const texture = initTextures(gl, program);
    if (!texture) {
        console.log('Failed to intialize the texture');
    }


    //const picture = initPicture(gl, program, './picture/6.jpg');
    let pictureTexture = [];
    for (let i = 0; i < 8; i++) {
        pictureTexture[i] = initPicture(gl, program, './picture/' + i + '.jpg');
    }


    let passwordTexture = initPicture(gl, program, './picture/password.jpg');

    floorTexture.a = initPicture(gl, program, './picture/floor.png');
    floorTexture.b = initPicture(gl, program, './picture/floor.jpg');
    ceilingTexture.a = initPicture(gl, program, './picture/ceiling.jpg');
    ceilingTexture.b = initPicture(gl, program, './picture/ceiling_reserve.jpg');

    wallTexture = initPicture(gl, program, './picture/rooma.jpg');
    skyTexture = initPicture(gl, program, './picture/roomb.jpg');
    wall2Texture = initPicture(gl, program, './picture/roomc.jpg');

    let doorTexture = initPicture(gl, program, './picture/doora.jpg');
    doorBTexture = initPicture(gl, program, './picture/doorb.jpg');
    doorCTexture = initPicture(gl, program, './picture/doorc.jpg');

    qrTexture = initPicture(gl, program, './picture/qrPicture.png');
    problemTexture = initPicture(gl, program, './picture/problem.jpg');
    blackTexture = initPicture(gl, program, './picture/black.bmp');

    //gl.uniform4f(program.u_Light, 1.0, 1.0, 1.0, 1.0);
    /*if (!picture) {
        console.log('Fialed to intialize picture');
        return;
    }*/

    //set clear color, enable depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //projection and view matrix
    const viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 0.01, 300.0);

    viewProjMatrix.lookAt(eye[0], eye[1], eye[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);

    let currentAngle = [0.0, 0.0];
    initEventHandlers(gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
        pictureTexture, passwordTexture);

    document.onkeydown = function(ev) {
        keydown(ev, pictureContent, eye, lookAt, currentAngle);
    };

    socket = io.connect('http://192.168.1.109:3000');
    socket.on('event', function (data) {
        if (data === 'electricity') lightOn = true;
        else if (data === 'qrOn') qrOn = true;
    });

    //password

    const tick = function() {
        draw(gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
            pictureTexture, passwordTexture);

        if (puzzleSolved === false)
            puzzleCheck();

        window.requestAnimationFrame(tick, canvas);
    };
    tick();
}

function drawPhotoFrame(gl, program, o, texture, viewProjMatrix) {
    pushMatrix(modelMatrix);
    modelMatrix.translate(-3.25, 0.0, 0.0);
    modelMatrix.scale(0.5, 7.0, 0.5);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, o, texture, viewProjMatrix);
    modelMatrix = popMatrix();

    pushMatrix(modelMatrix);
    modelMatrix.translate(0.0, 3.25, 0.0);
    modelMatrix.scale(6.0, 0.5, 0.5);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, o, texture, viewProjMatrix);
    modelMatrix = popMatrix();

    pushMatrix(modelMatrix);
    modelMatrix.translate(3.25, 0.0, 0.0);
    modelMatrix.scale(0.5, 7.0, 0.5);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, o, texture, viewProjMatrix);
    modelMatrix = popMatrix();

    pushMatrix(modelMatrix);
    modelMatrix.translate(0.0, -3.25, 0.0);
    modelMatrix.scale(6.0, 0.5, 0.5);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, o, texture, viewProjMatrix);
    modelMatrix = popMatrix();

}

function initTextures(gl, program) {
    const texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return null;
    }

    const image = new Image();  // Create a image object
    if (!image) {
        console.log('Failed to create the image object');
        return null;
    }
    // Register the event handler to be called when image loading is completed
    image.onload = function() {
        // Write the image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Pass the texure unit 0 to u_Sampler
        gl.useProgram(program);
        gl.uniform1i(program.u_Sampler, 0);

        gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
    };

    image.src = './picture/table.jpg';

    return texture;
}

function initPicture(gl, program, path) {
    const texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return null;
    }

    const image = new Image();  // Create a image object
    if (!image) {
        console.log('Failed to create the image object');
        return null;
    }
    // Register the event handler to be called when image loading is completed
    image.onload = function() {
        // Write the image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Pass the texure unit 0 to u_Sampler
        gl.useProgram(program);
        gl.uniform1i(program.u_Sampler, 1);

        gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
    };

    image.src = path;

    return texture;
}

function initVertexBuffers(gl) {
    const vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);

    const indices = new Uint8Array([        // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    const texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    let o = {};
    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);

    if (!o.indexBuffer || !o.vertexBuffer || !o.texCoordBuffer)
        return null;

    o.numIndices = indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    const buffer = gl.createBuffer();   // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Keep the information necessary to assign to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
    const buffer = gl.createBuffer();　  // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.type = type;

    return buffer;
}

function drawCube(gl, program, o, texture, viewProjMatrix) {
    gl.useProgram(program);

    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
    initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    if (lightOn === false)
        gl.uniform1i(program.u_LightOn, 0);
    else
        gl.uniform1i(program.u_LightOn, 1);

    gl.uniform1i(program.u_Sampler, 0);
    //
    gl.uniform1i(program.u_UsingTexCoord, 1);

    let mvpMatrix = new Matrix4();
    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

function drawColoredCube(gl, program, o, color, viewProjMatrix) {
    gl.useProgram(program);

    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
    initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

    gl.uniform1i(program.u_UsingTexCoord, 0);
    gl.uniform4f(program.u_Color, color[0], color[1], color[2], color[3]);

    let mvpMatrix = new Matrix4();
    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

function keydown(ev, pictureContent, eye, lookAt, currentAngle) {
    //if (puzzleSolved) {
    //    return;
    //}

    let emptySite = -1;
    let target = -1;

    for (let i = 0; i < 9; i++) {
        if (pictureContent[i] === 8) {
            emptySite = i;
            break;
        }
    }

    const step = 0.05;
    let newSite = [0.0, 0.0, 0.0];
    let angle = currentAngle[1] * Math.PI / 180;
    //console.log(currentAngle[1]);

    switch (ev.keyCode) {
        case 38: //up, cube moves down
            if (emptySite + 3 < 9) {
                target = emptySite + 3;
            }
            break;
        case 40: //down, cube moves up
            if (emptySite - 3 >= 0) {
                target = emptySite - 3;
            }
            break;
        case 37: //left, cube moves right
            if (emptySite % 3 !== 2) {
                target = emptySite + 1;
            }
            break;
        case 39: //right, cube move left
            if (emptySite % 3 !== 0) {
                target = emptySite - 1;
            }
            break;
        case 87: //w
            newSite[0] = eye[0] - step * Math.cos(angle);
            newSite[1] = eye[1];
            newSite[2] = eye[2] + step * Math.sin(angle);
            if (canMoveTo(newSite)) {
                eye[0] -= step * Math.cos(angle);
                eye[2] += step * Math.sin(angle);
                lookAt[0] -= step * Math.cos(angle);
                lookAt[2] += step * Math.sin(angle);
            }
            break;
        case 65: //a
            newSite[0] = eye[0] + step * Math.sin(angle);
            newSite[1] = eye[1];
            newSite[2] = eye[2] + step * Math.cos(angle);
            if (canMoveTo(newSite)) {
                eye[0] += step * Math.sin(angle);
                eye[2] += step * Math.cos(angle);
                lookAt[0] += step * Math.sin(angle);
                lookAt[2] += step * Math.cos(angle);
            }
            break;
        case 68: //d
            newSite[0] = eye[0] - step * Math.sin(angle);
            newSite[1] = eye[1];
            newSite[2] = eye[2] - step * Math.cos(angle);
            if (canMoveTo(newSite)) {
                eye[0] -= step * Math.sin(angle);
                eye[2] -= step * Math.cos(angle);
                lookAt[0] -= step * Math.sin(angle);
                lookAt[2] -= step * Math.cos(angle);
            }
            break;
        case 83: //s
            newSite[0] = eye[0] + step * Math.cos(angle);
            newSite[1] = eye[1];
            newSite[2] = eye[2] - step * Math.sin(angle);
            if (canMoveTo(newSite)) {
                eye[0] += step * Math.cos(angle);
                eye[2] -= step * Math.sin(angle);
                lookAt[0] += step * Math.cos(angle);
                lookAt[2] -= step * Math.sin(angle);
            }
            break;
        /* case 90: //z
            lightOn = true;
            break;
        case 88: //x
            qrOn = true;
            break; */
    }
    if (emptySite != -1 && target != -1) {
        let tmp = pictureContent[emptySite];
        pictureContent[emptySite] = pictureContent[target];
        pictureContent[target] = tmp;
    }
}

function canMoveTo(newSite) {
    let availableSpace = [[0.2, 0.2, 0.8, 3.8], [0.2, 0.2, 2.8, 0.8], [2.2, 0.2, 2.8, 1.8], [1.2, 1.2, 1.8, 2.8],
        [1.2, 1.2, 6.8, 1.8], [2.2, 2.2, 2.8, 3.8], [0.2, 3.2, 2.8, 3.8], [2.2, 2.2, 3.8, 2.8],
        [3.2, 0.2, 6.8, 0.8], [6.2, 0.2, 6.8, 3.8], [5.2, 3.2, 6.8, 3.8], [5.2, 3.2, 5.8, 4.8],
        [4.2, 4.2, 5.8, 4.8], [4.2, 2.2, 4.8, 4.8], [4.2, 2.2, 5.8, 2.8], [3.2, 3.2, 4.8, 3.8],
        [3.2, 3.2, 3.8, 4.8], [2.2, 4.2, 3.8, 4.8], [0.2, 4.2, 0.8, 6.8], [0.2, 4.2, 1.8, 4.8],
        [1.2, 4.2, 1.8, 6.8], [1.2, 6.2, 4.8, 6.8], [2.2, 4.2, 2.8, 6.8], [4.2, 5.2, 4.8, 6.8],
        [3.2, 5.2, 6.8, 5.8], [5.2, 6.2, 6.8, 6.8], [6.2, 4.2, 6.8, 6.8]];
    let ret = false;
    if (newSite[0] >= 3.7 && newSite[0] <= 4.2 && newSite[2] >= 1.0 && newSite[2] <= 2.0)
        return ret;

    for (let i = 0; i < availableSpace.length; i++) {
        if (i == 16)
            continue;
        let tuple = availableSpace[i];
        if (newSite[0] >= tuple[0] && newSite[0] <= tuple[2] && newSite[2] >= tuple[1] && newSite[2] <= tuple[3]) {
            ret = true;
            break;
        }
    }
    return ret;
}

function initEventHandlers(gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
                           pictureTexture, passwordTexture) {
    let dragging = false;
    let lastX = -1, lastY = -1;

    canvas.onmousedown = function(ev) {
        let x = ev.clientX, y = ev.clientY;
        let rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x;
            lastY = y;
            dragging = true;

            let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            let picked = check(x_in_canvas, y_in_canvas, gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
                pictureTexture, passwordTexture);
            if (picked != 0) {
                switch (picked) {
                    case 1:
                        door1Clicked();
                        break;
                    case 2:
                        door2Clicked();
                        break;
                    case 3:
                        door3Clicked();
                        break;
                    default:
                        break;
                }
                dragging = false;
            }
        }
    };

    canvas.onmouseup = function(ev) {
        dragging = false;
    };

    canvas.onmousemove = function(ev) {
        let x = ev.clientX, y = ev.clientY;
        if (dragging) {
            let factor = 100/canvas.height;
            let dx = factor * (x - lastX);
            let dy = factor * (y - lastY);
            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
            currentAngle[1] = currentAngle[1] + dx;
        }
        lastX = x; lastY = y;
    };
}

function check(x, y, gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
               pictureTexture, passwordTexture) {
    let picked = 0;
    gl.uniform1i(program.u_Clicked, 1);
    gl.uniform4f(program.u_Color, 0.8, 0.8, 0.8, 1.0);
    mouseClick = true;
    draw(gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
        pictureTexture, passwordTexture);
    let pixels = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (pixels[0] === 255)
        picked = 1;
    else if (pixels[1] === 255)
        picked = 2;
    else if (pixels[2] === 255)
        picked = 3;
    gl.uniform1i(program.u_Clicked, 0);
    mouseClick = false;
    draw(gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
        pictureTexture, passwordTexture);
    return picked;
}

function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}


let matrixStack = [];
function pushMatrix(matrix) {
    let m2 = new Matrix4(matrix);
    matrixStack.push(m2);
}

function popMatrix() {
    return matrixStack.pop();
}

function draw(gl, program, canvas, currentAngle, cube, texture, wallTexture, doorTexture,
        pictureTexture, passwordTexture) {
    let textureUse;
    if (chapter === 0)
        textureUse = wallTexture;
    else if (chapter === 1)
        textureUse = skyTexture;
    else
        textureUse = wall2Texture;

    const viewProjMatrix = new Matrix4();

    viewProjMatrix.setPerspective(75.0, canvas.width/canvas.height, 0.1, 300.0);

    viewProjMatrix.rotate(-currentAngle[0], 1.0, 0.0, 0.0);
    viewProjMatrix.rotate(-currentAngle[1], 0.0, 1.0, 0.0);

    viewProjMatrix.lookAt(eye[0], eye[1], eye[2], lookAt[0], lookAt[1], lookAt[2], up[0], up[1], up[2]);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawMazeWall(gl, program, cube, textureUse, viewProjMatrix);

    drawRoomOutline(gl, program, cube, textureUse, viewProjMatrix);

    drawDoorA(gl, program, cube, doorTexture, viewProjMatrix);
    drawDoorB(gl, program, cube, viewProjMatrix);
    drawDoorC(gl, program, cube, viewProjMatrix);
    drawFloor(gl, program, cube, viewProjMatrix);

    if (qrOn)
        drawQR(gl, program, cube, viewProjMatrix);
    drawProblem(gl, program, cube, viewProjMatrix);

    pushMatrix(modelMatrix);
    modelMatrix.translate(0.5, 0.0, 6.9);
    modelMatrix.rotate(180, 0.0, 1.0, 0.0);
    modelMatrix.scale(1/8, 1/8, 0.2);
    drawPuzzle(gl, program, cube, texture, viewProjMatrix, pictureTexture, passwordTexture);
    modelMatrix = popMatrix();

}

function puzzleCheck() {
    let solved = true;
    for (let i = 0; i < 9; i++) {
        if (pictureContent[i] !== i)
            solved = false;
    }
    if (solved) {
        puzzleSolved = true;
        alert("好像拼图背后的密码代表着什么");
        socket.emit('event', 'doorOpen');
    }
}