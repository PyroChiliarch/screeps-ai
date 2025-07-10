var Entities = require('./entities');
let Query = require('./query');
let Util = require('./util');

module.exports = {


    spawnSystem: function() {
        
        let colonies = Query.colonyQuery().result;

        for (let colony of colonies) {

            // Get home room
            let homeRoom = Game.rooms[colony.id];

            
            // Get spawn
            let spawn = homeRoom.find(FIND_MY_SPAWNS)[0];

            // Get Creep count
            let creepCount = homeRoom.find(FIND_MY_CREEPS).length;


            
            if (creepCount < 10) {

                // Spawn Creep
                let creepName = colony.id + '_' + Util.gen_id();
                let result = spawn.spawnCreep([WORK, CARRY, MOVE], creepName);

                // Skip entity creation if spawn fails
                if (result !== OK) {
                    console.log("Failed to spawn creep: " + creepName + " " + result.toString());
                    continue;
                }


                console.log("ID: " + Game.creeps[creepName].id);


                // Create entity
                let id = Game.creeps[creepName].id;
                let entity = Entities.new(id, creepName);

                // Add components
                Entities.is_creep.add(entity); // This is a creep
                Entities.home_colony.add(entity, colony.id); // Creep has a home room

            }
            

            





        }
    },

};