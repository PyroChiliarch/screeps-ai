const entities = require('./entities');
var Systems = require('./systems');

module.exports = {
    run: function() {


        // Run systems
        Systems.spawnSystem();
        
        // Systems.moveSystem();
        // Systems.harvestSystem();
        // 

        // Run changes that must occour at end of the schedule

        // Add and remove components
        entities.run_changes();
        
    }
};