var Entities = require('./entities');

module.exports = {


    spawnSystem: function() {

        // Query for all colonies
        let colony_entities = query.colonyQuery();
        let creep_entities = query.creepQuery();

        for (let colony of colony_entities) {


            
            let colonyRoom = colony_entity.components.HomeRoom.room;

            let colonyCreeps = creep_entities.filter(creep => creep.room === colonyRoom);

            // Get sources in room

            let sources = colonyRoom.find(FIND_SOURCES);
            for (let source of sources) {
                let sourceCreeps = colonyCreeps.filter(creep => creep.source === source);
                if (sourceCreeps.length < 1) {
                    // Spawn creep
                }
            }
            

            // Get Ready spawns
            let readySpawns = Game.spawns.filter(spawn => spawn.ready);
        }

        // Calculate needed creeps
        


        // Get Ready spawns

        
        // Quene command to spawn creeps



    },


    moveSystem: function() {
        // Move system logic
    },
    
    harvestSystem: function() {
        // Harvest system logic
    },
    
    spawnSystem: function() {
        // Spawn system logic
    }
};