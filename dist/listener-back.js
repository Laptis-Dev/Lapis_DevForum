"use strict";
const KEYBOARD = document.addEventListener("keyup", KeyListener);
function KeyListener(esc) {
    if (esc.key === "Escape")
        history.back();
}
