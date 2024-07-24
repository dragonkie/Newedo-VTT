import LOGGER from "../system/logger.mjs";


export const NewedoSheetMixin = Base => {
    const mixin = foundry.applications.api.HandlebarsApplicationMixin;
    return class NewedoDocumentSheet extends mixin(Base) {
        static SHEET_MODES = { EDIT: 0, PLAY: 1 };

        static DEFAULT_OPTIONS = {
            form: { submitOnChange: true },
            window: {
                resizable: true,
            },
            actions: {// Default actions must be static functions
                editImage: this._onEditImage,
                toggleSheet: this._onToggleSheet,
                toggleOpacity: this._ontoggleOpacity,
                toggleEffect: this._onToggleEffect,
                editEffect: this._onEditEffect,
                deleteEffect: this._onDeleteEffect,
                createEffect: this._onCreateEffect,
                toggleDescription: this._onToggleDescription,
            }
        };

        /* -------------------------------- SHEET MODE CONTROLS -------------------------------- */
        get sheetMode() {
            return this._sheetMode;
        }

        get isPlayMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
        }

        get isEditMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
        }

        /* -------------------------------- ACTION EVENTS -------------------------------- */

        /* -------------------------------- TAB GROUPINGS -------------------------------- */
        tabGroups = {};

        static TABS = {};

        _getTabs() {
            return Object.values(this.constructor.TABS).reduce((acc, v) => {
                const isActive = this.tabGroups[v.group] === v.id;
                if (isActive) LOGGER.log(`[${v.id}] is Active!`);
                acc[v.id] = {
                    ...v,
                    active: isActive,
                    cssClass: isActive ? "item active" : "item",
                    tabCssClass: isActive ? "tab active" : "tab"
                };
                return acc;
            }, {});
        }

        /* -------------------------------- RENDER FUNCTIONS -------------------------------- */
        _onRender(context, options) {
            super._onRender(context, options);
            if (!this.isEditable) {
                LOGGER.log(`Disabling sheet inputs`);
                this.element.querySelectorAll("input, select, textarea, multi-select").forEach(n => {
                    n.disabled = true;
                })
            }
            this._setupDragAndDrop();
        }

        /* -------------------------------- DRAG AND DROP -------------------------------- */
        _setupDragAndDrop() {
            const dd = new DragDrop({
                dragSelector: "[data-item-uuid]",
                dropSelector: ".application",
                permissions: {
                    dragstart: this._canDragStart.bind(this),
                    drop: this._canDragDrop.bind(this)
                },
                callbacks: {
                    dragstart: this._onDragStart.bind(this),
                    drop: this._onDrop.bind(this)
                }
            });
            dd.bind(this.element);
        }

        _canDragStart(selector) {
            return true;
        }

        _canDragDrop(selector) {
            return this.isEditable && this.document.isOwner;
        }

        /**
         * Prepares DragDrop data transfer
         * @param {*} event 
         */
        async _onDragStart(event) {
            LOGGER.debug(`SHEET | BASE | Drag Event Started`, event);
            const uuid = event.currentTarget.closest("[data-item-uuid]").dataset.itemUuid;
            const item = await fromUuid(uuid);
            const data = item.toDragData();
            event.dataTransfer.setData("text/plain", JSON.stringify(data));
        }

        async _onDrop(event) {
            LOGGER.debug('SHEET | BASE | Drop Recieved:', event);
            event.preventDefault();

            const target = event.target;
            const { type, uuid } = TextEditor.getDragEventData(event);

            if (!this.isEditable) return;

            const item = await fromUuid(uuid);
            const itemData = item.toObject();

            // Disallow dropping invalid document types.
            if (!Object.keys(this.document.constructor.metadata.embedded).includes(type)) {
                LOGGER.debug("Invalid Drop doc type");
                return;
            }

            // If dropped onto self, perform sorting.
            if (item.parent === this.document) return this._onSortItem(item, target);

            // Removes these values from the data, preppoing the drop to be added to the reciever
            const modification = {
                "-=_id": null,
                "-=ownership": null,
                "-=folder": null,
                "-=sort": null
            };

            switch (type) {
                case "ActiveEffect": {
                    // Specific data to overide for active effects
                    foundry.utils.mergeObject(modification, {
                        "duration.-=combat": null,
                        "duration.-=startRound": null,
                        "duration.-=startTime": null,
                        "duration.-=startTurn": null,
                        "system.source": null
                    });
                    break;
                }
                case "Item": {
                    // Checks to see if the sheet overides item drops
                    if (await this._onDropItem(event, item) != 'default') return;
                    break;
                }
                default: return;
            }
            LOGGER.debug(`Default drop handler`, itemData);
            foundry.utils.mergeObject(itemData, modification, { performDeletions: true });
            getDocumentClass(type).create(itemData, { parent: this.document });
        }

        async _onDropItem(event, item) {
            // Item drops can be intercepted by overiding this function and returning any other value
            return 'default';
        }

        async _onDropActor() {
            LOGGER.error(`Unhandled actor drop`, this);
        }

        async _onSortItem(item, target) {
            if (item.documentName !== "Item") return;
            LOGGER.debug('Sorting item');
            const self = target.closest("[data-tab]")?.querySelector(`[data-item-uuid="${item.uuid}"]`);
            if (!self || !target.closest("[data-item-uuid]")) return;

            let sibling = target.closest("[data-item-uuid]") ?? null;
            if (sibling?.dataset.itemUuid === item.uuid) return;
            if (sibling) sibling = await fromUuid(sibling.dataset.itemUuid);

            let siblings = target.closest("[data-tab]").querySelectorAll("[data-item-uuid]");
            siblings = await Promise.all(Array.from(siblings).map(s => fromUuid(s.dataset.itemUuid)));
            siblings.findSplice(i => i === item);

            let updates = SortingHelpers.performIntegerSort(item, { target: sibling, siblings: siblings, sortKey: "sort" });
            updates = updates.map(({ target, update }) => ({ _id: target.id, sort: update.sort }));
            this.document.updateEmbeddedDocuments("Item", updates);
        }

        _syncPartState(partId, newElement, priorElement, state) {

            super._syncPartState(partId, newElement, priorElement, state);

            // Refocus on a delta.
            const focus = newElement.querySelector(":focus");
            if (focus && focus.classList.contains("delta")) focus.select();

            // Fade in or out a toggled effect.
            if (partId === "effects") {
                newElement.querySelectorAll("[data-item-uuid].effect").forEach(n => {
                    const uuid = n.dataset.itemUuid;
                    const newWrapper = n.querySelector(".wrapper");
                    const oldWrapper = priorElement.querySelector(`[data-item-uuid="${uuid}"].effect .wrapper`);
                    if (oldWrapper) {
                        newWrapper.animate([
                            { opacity: oldWrapper.style.opacity },
                            { opacity: newWrapper.style.opacity }
                        ], { duration: 200, easing: "ease-in-out" });
                    }
                });
            }
        }

        _setupContextMenu() {
            new artichron.applications.ContextMenuArtichron(this.element, "[data-item-uuid]", [], {
                onOpen: element => {
                    const item = fromUuidSync(element.dataset.itemUuid);
                    if (!item) return;
                    if (item.documentName === "ActiveEffect") ui.context.menuItems = this._getEffectContextOptions(item);
                    else if (item.documentName === "Item") ui.context.menuItems = this._getItemContextOptions(item);
                }
            });
        }

        static _onEditImage(event, target) {
            if (!this.isEditable) return;
            const current = this.document.img;
            const fp = new FilePicker({
                type: "image",
                current: current,
                callback: path => this.document.update({ img: path }),
                top: this.position.top + 40,
                left: this.position.left + 10
            });
            fp.browse();
        }

        async createEmbeddedDocuments(type, list) {
            LOGGER.log('Creating new items', list);
            return super.createEmbeddedDocuments(type, list);
        }
    }
}