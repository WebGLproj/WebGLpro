/**
 * Created by Li Bo on 2017/1/5.
 */

function door1Clicked() {
    if (chapter != 0) {
        alert("前面房间的谜题好像已经解决了，没什么要做的了");
    } else {
        let password = prompt("请输入四位数密码:","");
        if (password !== null && password.toString() === "7825") {
            alert("密码正确，第一道大门开启");
            alert("你打开了大门，发现大门后还有一个房间");

            chapter = 1;

            eye = [3.5, 0, 3.5];
            lookAt = [2.5, 0, 3.5];
        } else {
            alert("密码错误");
        }
    }

}

function door2Clicked() {
    if (chapter != 1) {
        alert("前面房间的谜题好像已经解决了，没什么要做的了");
    } else {
        let password = prompt("请输入六位数密码ABCDEF\n提示：ABCDEF = 9","");

        if (password === null) {
            alert("密码错误");
            return;
        }

        let num = parseInt(password.toString());
        let numRoot = (num - 1) % 9 + 1;
        if (password.length === 6 && numRoot === 9) {
            alert("密码正确，第二道大门开启");
            alert("你打开了大门，发现大门后还有一个房间");

            chapter = 2;

            eye = [3.5, 0, 1.5];
            lookAt = [2.0, 0, 1.5];
        } else {
            alert("密码错误");
        }
    }
}

function door3Clicked() {
    let password = prompt("请输入四位密码：");
    if (password !== null && password.toString() === "3521") {
        alert("密码正确，你通关了！");
        socket.emit("event", "over1");
        window.location.replace("http://192.168.1.109:3000");
    } else {
        alert("密码错误");
    }
}
