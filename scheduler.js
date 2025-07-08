const entities = require('./entities');
var Systems = require('./systems');

module.exports = {
    run: function() {


        // Run systems
        
        // Systems.moveSystem();
        // Systems.harvestSystem();
        // Systems.spawnSystem();

        // Run changes that must occour at end of the schedule

        // Add and remove components
        entities.run_changes();
        
    }
};