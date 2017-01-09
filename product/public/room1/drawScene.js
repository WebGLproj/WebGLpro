/**
 * Created by Li Bo on 2017/1/4.
 */

function drawMazeWall(gl, program, cube, texture, viewProjMatrix) {
    let wallInfo = [[3.0, 0.5, true], [3.5, 1.0, false], [4.5, 1.0, false], [5.5, 1.0, false],
        [1.5, 1.0, false], [1.0, 1.5, true], [1.0, 2.5, true], [1.5, 3.0, false],
        [2.0, 2.5, true], [2.5, 2.0, false], [3.5, 2.0, false], [4.5, 2.0, false],
        [5.5, 2.0, false], [6.0, 2.5, true], [5.5, 3.0, false], [5.0, 3.5, true],
        [4.0, 2.5, true], [3.5, 3.0, false], [3.0, 3.5, true], [2.5, 4.0, false],
        [1.5, 4.0, false], [0.5, 4.0, false], [2.0, 4.5, true], [2.0, 5.5, true],
        [1.0, 5.5, true], [1.0, 6.5, true], [4.0, 4.5, true], [3.5, 5.0, false],
        [3.0, 5.5, true], [3.5, 6.0, false], [4.5, 5.0, false], [5.5, 5.0, false],
        [6.0, 4.5, true], [6.5, 4.0, false], [5.5, 6.0, false], [5.0, 6.5, true]
    ];

    let n = wallInfo.length;
    for (let i = 0; i < n; i++) {
        let wallItem = wallInfo[i];
        pushMatrix(modelMatrix);
        modelMatrix.translate(wallItem[0], 0.0, wallItem[1]);
        if (wallItem[2]) {
            modelMatrix.scale(0.1, 1.0, 1.0);
        } else {
            modelMatrix.scale(1.0, 1.0, 0.1);
        }
        modelMatrix.scale(0.5, 0.5, 0.5);
        drawCube(gl, program, cube, texture, viewProjMatrix);
        modelMatrix = popMatrix();
    }
}

function drawRoomOutline(gl, program, cube, texture, viewProjMatrix) {
    for (let i = 0; i < 7; i++) {
        pushMatrix(modelMatrix);
        modelMatrix.translate(i + 0.5, 0.0, 0.0);
        modelMatrix.scale(1.0, 1.0, 0.1);
        modelMatrix.scale(0.5, 0.5, 0.5);
        drawCube(gl, program, cube, texture, viewProjMatrix);
        modelMatrix = popMatrix();
    }

    for (let i = 0; i < 7; i++) {
        pushMatrix(modelMatrix);
        modelMatrix.translate(i + 0.5, 0.0, 7.0);
        modelMatrix.scale(1.0, 1.0, 0.1);
        modelMatrix.scale(0.5, 0.5, 0.5);
        drawCube(gl, program, cube, texture, viewProjMatrix);
        modelMatrix = popMatrix();
    }

    for (let i = 0; i < 7; i++) {

        if (i === 2)
            continue;

        pushMatrix(modelMatrix);
        modelMatrix.translate(0.0, 0.0, i + 0.5);
        modelMatrix.scale(0.1, 1.0, 1.0);
        modelMatrix.scale(0.5, 0.5, 0.5);
        drawCube(gl, program, cube, texture, viewProjMatrix);
        modelMatrix = popMatrix();
    }

    for (let i = 0; i < 7; i++) {
        pushMatrix(modelMatrix);
        modelMatrix.translate(7.0, 0.0, i + 0.5);
        modelMatrix.scale(0.1, 1.0, 1.0);
        modelMatrix.scale(0.5, 0.5, 0.5);
        drawCube(gl, program, cube, texture, viewProjMatrix);
        modelMatrix = popMatrix();
    }


    /*pushMatrix(modelMatrix);
    modelMatrix.translate(0.0, 0.0, 3.5);
    modelMatrix.scale(0.1, 1.0, 7.0);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawColoredCube(gl, program, cube, [0.4, 0.4, 0.4, 1.0], viewProjMatrix);
    modelMatrix = popMatrix();

    pushMatrix(modelMatrix);
    modelMatrix.translate(3.5, 0.0, 0.0);
    modelMatrix.scale(7.0, 1.0, 0.1);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawColoredCube(gl, program, cube, [0.4, 0.4, 0.4, 1.0], viewProjMatrix);
    modelMatrix = popMatrix();

    pushMatrix(modelMatrix);
    modelMatrix.translate(3.5, 0.0, 7.0);
    modelMatrix.scale(7.0, 1.0, 0.1);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawColoredCube(gl, program, cube, [0.4, 0.4, 0.4, 1.0], viewProjMatrix);
    modelMatrix = popMatrix(); */
}

function drawDoorA(gl, program, cube, doorTexture, viewProjMatrix) {
    if (mouseClick) {
        gl.uniform4f(program.u_Color, 1.0, 0.0, 0.0, 1.0);
    }

    pushMatrix(modelMatrix);
    modelMatrix.translate(3.5, 0.0, 4.002);
    modelMatrix.scale(1.0, 1.0, 0.001);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, cube, doorTexture, viewProjMatrix);
    modelMatrix = popMatrix();

    gl.uniform4f(program.u_Color, 0.8, 0.8, 0.8, 1.0);
}

function drawDoorB(gl, program, cube, viewProjMatrix) {
    if (mouseClick) {
        gl.uniform4f(program.u_Color, 0.0, 1.0, 0.0, 1.0);
    }

    pushMatrix(modelMatrix);
    modelMatrix.translate(4.0, 0.0, 1.5);
    modelMatrix.scale(0.001, 1.0, 1.0);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, cube, doorBTexture, viewProjMatrix);
    modelMatrix = popMatrix();

    gl.uniform4f(program.u_Color, 0.8, 0.8, 0.8, 1.0);
}

function drawDoorC(gl, program, cube, viewProjMatrix) {
    if (mouseClick) {
        gl.uniform4f(program.u_Color, 0.0, 0.0, 1.0, 1.0);
    }

    pushMatrix(modelMatrix);
    modelMatrix.translate(0.0, 0.0, 2.5);
    modelMatrix.scale(0.1, 1.0, 1.0);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, cube, doorCTexture, viewProjMatrix);
    modelMatrix = popMatrix();

    gl.uniform4f(program.u_Color, 0.8, 0.8, 0.8, 1.0);
}

function drawPuzzle(gl, program, cube, texture, viewProjMatrix, pictureTexture, passwordTexture) {
    drawPhotoFrame(gl, program, cube, texture, viewProjMatrix);

    if (!puzzleSolved) {
        for (let i = 0; i < 9; i++) {
            let content = pictureContent[i];
            if (content === 8) {
                continue;
            }
            pushMatrix(modelMatrix);
            modelMatrix.translate(pictureTranslateX[i], pictureTranslateY[i], 0);
            modelMatrix.scale(1.0, 1.0, 0.25);
            drawCube(gl, program, cube, pictureTexture[content], viewProjMatrix);
            modelMatrix = popMatrix();
        }
    } else {
        pushMatrix(modelMatrix);
        modelMatrix.translate(0, 0, 0);
        modelMatrix.scale(3.0, 3.0, 0.25);
        drawCube(gl, program, cube, passwordTexture, viewProjMatrix);
        modelMatrix = popMatrix();
    }
}

function drawFloor(gl, program, cube, viewProjMatrix) {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            pushMatrix(modelMatrix);
            modelMatrix.translate(i + 0.5, -0.55, j + 0.5);
            modelMatrix.scale(1.0, 0.1, 1.0);
            modelMatrix.scale(0.5, 0.5, 0.5);
            if (chapter === 0)
                drawCube(gl, program, cube, floorTexture.a, viewProjMatrix);
            else
                drawCube(gl, program, cube, floorTexture.b, viewProjMatrix);
            modelMatrix = popMatrix();
        }
    }

    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            pushMatrix(modelMatrix);
            modelMatrix.translate(i + 0.5, 0.55, j + 0.5);
            modelMatrix.scale(1.0, 0.1, 1.0);
            modelMatrix.scale(0.5, 0.5, 0.5);
            if (chapter === 0)
                drawCube(gl, program, cube, ceilingTexture.a, viewProjMatrix);
            else
                drawCube(gl, program, cube, ceilingTexture.b, viewProjMatrix);
            modelMatrix = popMatrix();
        }
    }
}

function drawQR(gl, program, cube, viewProjMatrix) {
    pushMatrix(modelMatrix);
    modelMatrix.translate(3.05, 0.0, 0.5);
    modelMatrix.scale(0.01, 0.90, 0.90);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, cube, qrTexture, viewProjMatrix);
    //drawColoredCube(gl, program, cube, [0.6, 0.6, 0.7, 1.0], viewProjMatrix);
    modelMatrix = popMatrix();
}

function drawProblem(gl, program, cube, viewProjMatrix) {
    pushMatrix(modelMatrix);
    modelMatrix.translate(3.95, 0.0, 2.5);
    modelMatrix.scale(0.01, 0.90, 0.90);
    modelMatrix.scale(0.5, 0.5, 0.5);
    drawCube(gl, program, cube,problemTexture, viewProjMatrix);
    //drawColoredCube(gl, program, cube, [0.6, 0.6, 0.7, 1.0], viewProjMatrix);
    modelMatrix = popMatrix();
}