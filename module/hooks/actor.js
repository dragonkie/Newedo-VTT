import LOGGER from "../utility/logger.mjs";
import systemUtility from "../utility/systemUtility.mjs";

/* 
prepares the hook calls for all actors
even if some are not used, all of them are documented and listed here for convinience
*/
const actorHooks = () => {
    Hooks.on("createActor", async (doc, createData) => {
        if (doc.type === `character`) {
            LOGGER.debug(`HOOK | createActor | CHARACTER`);
            const skillPack = game.packs.get(`newedo.internal_skills`);
            const skillList = [];
            if ( skillPack != undefined ) {
                for (let v of skillPack.index.contents) {
                    const item = await skillPack.getDocument(v._id);
                    skillList.push(item.toObject())  
                }
                await doc.createEmbeddedDocuments(`Item`, skillList);
            }
            
        }
    });
};

export default actorHooks;