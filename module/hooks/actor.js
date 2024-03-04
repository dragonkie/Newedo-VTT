import LOGGER from "../utility/logger.mjs";
import systemUtility from "../utility/systemUtility.mjs";

/* 
prepares the hook calls for all actors
even if some are not used, all of them are documented and listed here for convinience
*/
const actorHooks = () => {
    Hooks.on("createActor", async (doc, createData) => {
        if (doc.type === `character`) {
            LOGGER.debug(`Adding standard items to new actor`);
            //item packs pulled from the hidden internal compendiums to provide essential items used by everyone
            const skillPack = game.packs.get(`newedo.internal_skills`);
            const fatePack = game.packs.get(`newedo.internal_fates`);
            //Array to hold the items being added
            const itemList = [];
            //if the skill compendium is found, add all of the items in it to the list of items being added to the character sheet
            if ( skillPack != undefined ) {
                for (let v of skillPack.index.contents) {
                    const item = await skillPack.getDocument(v._id);
                    itemList.push(item.toObject())  
                }
            } else ui.notifications.warn("Couldn't find internal skills compendium");

            if ( fatePack != undefined ) {
                for (let v of fatePack.index.contents) {
                    const item = await fatePack.getDocument(v._id);
                    itemList.push(item.toObject());
                }
            } else await ui.notifications.warn("Couldn't find internal fate compendium");
            //adds the items to the final character sheet
            if (itemList.length > 0) await doc.createEmbeddedDocuments(`Item`, itemList);

            //adds default flags to the sheet
            doc.setFlag(game.system.id, `sheetLocked`, false);//toggleable from sheet to swap on and off the editable mode
        }
    });
};

export default actorHooks;