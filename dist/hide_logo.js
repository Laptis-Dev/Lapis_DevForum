"use strict";
const logo = document.querySelector('.logo-title');
let logoParent = logo ? logo.parentNode : null;
let nextSibling = logo ? logo.nextSibling : null;
let resizeTimer;
function handleLogoVisibility() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const shouldHide = width < 1300 || height < 778;
    if (shouldHide) {
        if (logo && logo.parentNode) {
            logo.remove();
        }
    }
    else {
        if (logo && !logo.parentNode && logoParent) {
            if (nextSibling) {
                logoParent.insertBefore(logo, nextSibling);
            }
            else {
                logoParent.appendChild(logo);
            }
        }
    }
}
handleLogoVisibility();
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleLogoVisibility, 100);
});
