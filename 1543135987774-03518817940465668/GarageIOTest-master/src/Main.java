public class Main {

    public static void main(String[] args){
        IOClass io = new IOClass();

        /*Car car1 = new Car(io.readLine("Enter rgn: "),
                io.readInteger("Enter model year: "),

                io.readDouble("Enter weight: "),
                io.readDouble("Enter price: "),
                io.readDouble("Enter gas level: "),
                io.readDouble("Enter mileage: "),
                io.readDouble("Enter quality: "),
                io.readLine("Enter status: "));*/
        Garage garage = new Garage();
        garage.run();
        //System.out.println(car1.toString());

    }

}
