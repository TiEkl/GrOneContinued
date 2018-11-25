public class Car {

    String rgn;
    int modelYear;
    double weight, price, gasmeter, mileage, quality;
    String status = "Good";
    final String END_OF_LINE = System.lineSeparator();
    final double MAX_GAS_LEVEL = 10;

    public Car(String rgn, int modelYear, double weight, double price, double gasMeter, double mileage, double quality, String status){
        this.rgn = rgn;
        this.modelYear = modelYear;
        this.weight = weight;
        this.price = price;
        this.gasmeter = gasMeter;
        this.mileage = mileage;
        this.quality = quality;
        this.status = status;
    }

    public String getRgn() {
        return rgn;
    }

    public void setRgn(String rgn) {
        this.rgn = rgn;
    }

    public int getModelYear() {
        return modelYear;
    }

    public void setModelYear(int modelYear) {
        this.modelYear = modelYear;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getGasmeter() {
        return gasmeter;
    }

    public double getGasInLiter(){
        return this.gasmeter * 3.78;
    }

    public void setGasmeter(double gasmeter) {
        this.gasmeter = gasmeter;
    }

    public double getMileage() {
        return mileage;
    }

    public double getMileageInKm(){
        return this.mileage * 1.6;
    }

    public void setMileage(double mileage) {
        this.mileage = mileage;
    }

    public double getQuality() {
        return quality;
    }

    public void setQuality(double quality) {
        this.quality = quality;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getClassification(){
        if(weight <= 1600){
            return "Light";
        } else if (weight < 2300){
            return "Medium";
        } else {
            return "Heavy";
        }
    }

    public void testDrive(double mileage){
        this.mileage += mileage;
        this.gasmeter = this.gasmeter + mileage/25;
    }

    public void fillGas(double gallons){
        if(gasmeter + gallons > MAX_GAS_LEVEL) {
            gasmeter = MAX_GAS_LEVEL;
        }else {
            gasmeter += gallons;
        }
    }

    public String toString(){
        return rgn + ": " + getClassification() + END_OF_LINE +
                "Model Year: " + modelYear + END_OF_LINE +
                "Weight: " + weight + " kg" + END_OF_LINE +
                "Price: " + price + " kr" + END_OF_LINE +
                "Gas level: " + gasmeter + " gallons (" + getGasInLiter() + " L)" + END_OF_LINE +
                "Mileage: " + mileage + " miles (" + getMileageInKm() + " km)" + END_OF_LINE +
                "Quality value: " + quality + END_OF_LINE +
                "Status: " + status;
    }
}
