// models/carInfo.js
class CarInfo {
    constructor(brand, model, year, licenseplate) {
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.licenseplate = licenseplate;
    }
}

module.exports = CarInfo;