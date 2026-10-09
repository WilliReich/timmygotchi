/*
 * Small non-blocking replacement for alert(): shows a message at the top of
 * the game container and hides it after a few seconds. A message that is
 * still visible is not shown a second time, so a flood of identical errors
 * appears once.
 */
const SHOW_MS = 3000;

const Toast = {
    element: null,
    hideTimer: null,
};

Toast.show = function (message) {
    const text = String(message);
    if (this.element == null) {
        this.element = document.createElement('div');
        this.element.className = 'toast';
        document.querySelector('.game-container').appendChild(this.element);
    }
    if (this.element.classList.contains('visible') && this.element.textContent === text) {
        return;
    }
    this.element.textContent = text;
    this.element.classList.add('visible');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.element.classList.remove('visible'), SHOW_MS);
};

export default Toast;
