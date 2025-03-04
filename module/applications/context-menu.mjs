/**
 * A specialized subclass of ContextMenu that places the menu in a fixed position.
 * @extends {ContextMenu}
 */
export default class NewedoContextMenu extends ContextMenu {
    /** @override */
    _setPosition([html], [target], { event }) {
        document.body.appendChild(html);
        const { clientWidth, clientHeight } = document.documentElement;
        const { width, height } = html.getBoundingClientRect();
        const { clientX, clientY } = event;
        const left = Math.min(clientX, clientWidth - width) + 1;

        this._expandUp = clientY + height > clientHeight;
        html.classList.add("newedo");
        html.classList.toggle("expand-up", this._expandUp);
        html.classList.toggle("expand-down", !this._expandUp);
        html.style.visibility = "";
        html.style.left = `${left}px`;

        if (this._expandUp) html.style.bottom = `${clientHeight - clientY}px`;
        else html.style.top = `${clientY + 1}px`;
        
        target.classList.add("context");
        html.style.zIndex = `${_maxZ + 1}`;
    }
}