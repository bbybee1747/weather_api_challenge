import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
// Define a City class with name and id properties
class City {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
// Complete the HistoryService class
class HistoryService {
    // Define a read method that reads from the searchHistory.json file
    async read() {
        try {
            const data = await fs.promises.readFile(HistoryService.filePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }
    // Define a write method that writes the updated cities array to the searchHistory.json file
    async write(cities) {
        await fs.promises.writeFile(HistoryService.filePath, JSON.stringify(cities, null, 2));
    }
    // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities() {
        return await this.read();
    }
    // Define an addCity method that adds a city to the searchHistory.json file
    async addCity(name) {
        const cities = await this.read();
        const newCity = new City(name, uuidv4());
        cities.push(newCity);
        await this.write(cities);
    }
    // BONUS: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id) {
        const cities = await this.read();
        const updatedCities = cities.filter((city) => city.id !== id);
        await this.write(updatedCities);
    }
}
HistoryService.filePath = 'searchHistory.json';
export default new HistoryService();
