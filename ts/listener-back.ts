const KEYBOARD = document.addEventListener("keyup", KeyListener);
function KeyListener(esc: { key: string; }) {
  if (esc.key === "Escape")
    history.back();
}