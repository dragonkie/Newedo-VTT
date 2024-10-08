import LOGGER from "../helpers/logger.mjs";

export const NewedoSheetMixin = Base => {
    const mixin = foundry.applications.api.HandlebarsApplicationMixin;
    return class NewedoDocumentSheet extends mixin(Base) {

        static SHEET_MODES = {
            PLAY: 1,
            EDIT: 2,
        }

        static DEFAULT_OPTIONS = {
            classes: ['newedo', 'sheet'],
            form: { submitOnChange: true },
            window: { resizable: true },
            actions: {// Default actions must be static functions
                editImage: this._onEditImage,
                toggleSheet: this._onToggleSheet,
                toggleMode: this._onToggleMode,
                toggleOpacity: this._ontoggleOpacity,
                toggleEffect: this._onToggleEffect,
                editEffect: this._onEditEffect,
                deleteEffect: this._onDeleteEffect,
                createEffect: this._onCreateEffect,
                toggleDescription: this._onToggleDescription,
            }
        };

        /* -------------------------------- SHEET MODE CONTROLS -------------------------------- */
        _sheetMode = this.constructor.SHEET_MODES.PLAY;

        get sheetMode() {
            return this._sheetMode;
        }

        get isPlayMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
        }

        get isEditMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
        }

        /* -------------------------------- TAB GROUPINGS -------------------------------- */
        tabGroups = {};

        static TABS = {};

        async _prepareContext() {
            const doc = this.document;
            const rollData = doc.getRollData();

            const context = {
                document: doc,
                config: CONFIG.NEWEDO,
                system: doc.system,
                flags: doc.flags,
                name: doc.name,
                items: doc.items,
                itemTypes: doc.itemTypes,
                rollData: rollData,
                tabs: this._getTabs(),
                isEditMode: this.isEditMode,
                isPlayMode: this.isPlayMode,
                isEditable: this.isEditable
            }

            return context;

        }

        _getTabs() {
            return Object.values(this.constructor.TABS).reduce((acc, v) => {
                const isActive = this.tabGroups[v.group] === v.id;
                acc[v.id] = {
                    ...v,
                    active: isActive,
                    cssClass: isActive ? "item active" : "item",
                    tabCssClass: isActive ? "tab active" : "tab"
                };
                return acc;
            }, {});
        }

        /* -------------------------------- ACTION EVENTS -------------------------------- */
        static _onEditImage(event, target) {
            if (!this.isEditable) return;
            const current = this.document.img;
            const fp = new FilePicker({
                type: "image",
                current: current,
                callback: path => this.document.update({ 'img': path }),
                top: this.position.top + 40,
                left: this.position.left + 10
            });
            fp.browse();
        }

        /* -------------------------------- RENDER FUNCTIONS -------------------------------- */
        async render(options, _options) {
            LOGGER.trace(`BASE SHEET | render(); `, this);
            LOGGER.log(`BASE SHEET | render(); `, options);
            LOGGER.log(`BASE SHEET | render(); `, _options);
            return super.render(options, _options);
        }

        _onFirstRender(context, options) {
            LOGGER.debug('_onFirstRender', context)
            let r = super._onFirstRender(context, options);
            this._setupContextMenu();

            return r;
        }

        _onRender(context, options) {
            LOGGER.debug('_onRender', context);
            let r = super._onRender(context, options);
            
            if (!this.isEditable) {
                // Disables sheet inputs for non owners
                this.element.querySelectorAll("input, select, textarea, multi-select").forEach(n => {
                    n.disabled = true;
                })
            }
            
            this._setupDragAndDrop();
            return r;
        }

        async _renderHTML(context, options) {
            LOGGER.debug('_renderHTML', context)
            return super._renderHTML(context, options);
        }

        async _renderFrame(options) {
            LOGGER.debug("Injecting sheet lock button", this);
            const frame = super._renderFrame(options);

            // Insert additional buttons into the window header
            // In this scenario we want to add a lock button
            if (this.isEditable && !this.document.getFlag("core", "sheetLock")) {
                const label = game.i18n.localize("SHEETS.toggleLock");
                let icon = this.isEditMode ? 'fa-lock-open' : 'fa-lock';
                const sheetConfig = `<button type="button" class="header-control fa-solid ${icon}" data-action="toggleMode" data-tooltip="${label}" aria-label="${label}"></button>`;
                this.window.close.insertAdjacentHTML("beforebegin", sheetConfig);
            }

            return frame;
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
            new newedo.applications.NewedoContextMenu(this.element, "[data-item-uuid]", [], {
                onOpen: element => {
                    const item = fromUuidSync(element.dataset.itemUuid);
                    if (!item) return;
                    if (item.documentName === "ActiveEffect") ui.context.menuItems = this._getEffectContextOptions(item);
                    else if (item.documentName === "Item") ui.context.menuItems = this._getItemContextOptions(item);
                }
            });
        }

        _getItemContextOptions(item) {
            const isOwner = item.isOwner;
            const isEquipped = item.isEquipped;

            return [{
                name: "NEWEDO.ContextMenu.item.edit",
                icon: "<i class='fa-solid fa-edit'></i>",
                condition: () => isOwner,
                callback: () => item.sheet.render(true)
            }, {
                name: "NEWEDO.ContextMenu.item.delete",
                icon: "<i class='fa-solid fa-trash'></i>",
                condition: () => isOwner,
                callback: () => item.delete()
            }];
        }

        _getEffectContextOptions(item) {

        }

        static _onToggleMode() {
            if (this.isPlayMode) this._sheetMode = this.constructor.SHEET_MODES.EDIT;
            else this._sheetMode = this.constructor.SHEET_MODES.PLAY;
            const lock = this.window.header.querySelector('.fa-lock, .fa-lock-open');
            lock.classList.toggle('fa-lock');
            lock.classList.toggle('fa-lock-open');
            this.render(true);
        }

        async createEmbeddedDocuments(type, list) {
            LOGGER.log('Creating new items', list);
            return super.createEmbeddedDocuments(type, list);
        }
    }
}