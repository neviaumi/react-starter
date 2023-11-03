import { setupSeeder } from './umzug';

setupSeeder().then(seeder => seeder.runAsCLI());
