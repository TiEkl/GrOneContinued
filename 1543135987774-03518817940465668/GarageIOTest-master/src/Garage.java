import java.util.Scanner;
public class Garage {

    private static final int REGISTER_CAR = 1;
    private static final int PRINT_CARS = 2;
    private static final int PRINT_CAR = 3;
    private static final int PRINT_CHEAPEST_CAR = 4;
    private static final int DRIVE_CAR = 5;
    private static final int FILL_GAS = 6;
    private static final int REGISTER_MACHANIC = 7;
    private static final int REPAIR_CAR = 8;
    private static final int QUIT = 9;

    private Car[] cars;
    //private Mechanic[] mechanics;
    private final int MAX_GAS_LEVEL = 10; //10 gallons.
    private int registeredCars;
    private int registeredMechanics;

    private IOClass io;

    /*
     * Constructor to initialize your data set of cars and mechanics.
     * It begins empty. The default size is 5 cars and 5 mechanics.
     */

    public Garage() {
        final int MAX_CARS = 5;
        this.cars = new Car[MAX_CARS];
        this.registeredCars = 0;
        final int MAX_MECHANICS = 5;
        //this.mechanics = new Mechanic [MAX_MECHANICS];
        this.registeredMechanics = 0;
        io = new IOClass();
    }

    /*
     * This method will retrieve a car from the array based on a specified rgn.
     * If the car was not created and added to the array, it will return NULL,
     * meaning that the car does not exist in the system.
     *
     */
    public Car retrieveCar(String carRgn) {
        for (int i = 0; i < this.cars.length; i++) {
            if(!cars[i].equals(null) && cars[i].getRgn().equals(carRgn)) {
                return cars[i];
            }

        }
        return null;
    }



    public Car createCar() {
        return new Car(io.readLine("Enter rgn: "),
                io.readInteger("Enter model year: "),

                io.readDouble("Enter weight: "),
                io.readDouble("Enter price: "),
                io.readDouble("Enter gas level: "),
                io.readDouble("Enter mileage: "),
                io.readDouble("Enter quality: "),
                io.readLine("Enter status: "));
    }

    /*public Mechanic createMechanic() {
        /*TODO: Add logic to this method.

        1. read the mechanic's name and type.
        2. use that information to create the mechanic.
        3. change the null below to the
         right reference that you need to return!! */
      //  return null; //<--- change this.
    //}

    public void run() {

        int option;
        do {
            option = io.menu();

            switch (option) {
                case REGISTER_CAR:
                    Car newCar = createCar();
                    this.cars[registeredCars] = newCar;
                    this.registeredCars = this.registeredCars + 1;
                    break;
                case PRINT_CARS:
                    printAllCars();
                    break;
                case PRINT_CAR:
                    printOneCar();
                    break;
                case PRINT_CHEAPEST_CAR:
                    printCheapest();
                    break;
                case DRIVE_CAR:
                    drive();
                    break;
                case FILL_GAS:
                    fillGas();
                    break;
                case REGISTER_MACHANIC:
                    //createMechanic();
                    break;
                case REPAIR_CAR:
                    repairCar();
                    break;
                case QUIT:
                    io.writeLine("Thank you for visiting our Garage. See you soon! \n");
                    break;

                //case EDIT_CAR_INFORMATION:
                 //   editInfo();
                  //  break;

                default:
                    io.writeLine("Option "+option+" is not valid. \n");
                    break;
            }
        } while (option != QUIT);
    }

    public void printAllCars() {
        // TODO: Add the code for the logic below
        // 1. Iterate through all cars and print each one of them
        //    if they are not null!
        // BE CAREFUL! avoid printing nulls by checking:
        // if( car[i] != null ) { ... print it ... }
    }

    public void printOneCar() {
        String carRgn = readCarRgn();

        Car foundCar = retrieveCar(carRgn);
        if(!foundCar.equals(null)) {
            io.writeLine(foundCar.toString());
        } else {
            io.writeLine("No car with that rgn");
        }
    }

    public void printCheapest() {
        // TODO: Add the code for the logic below
        // 1. ask for the car's classification
        // 2. Iterate through all cars to get the ones with the classification specified
        // 3. Iterate through all the cars with this classification and find the one with the lowest price
        // 4. Print the found (cheapest) car
        // BE CAREFUL! avoid printing nulls by checking:
        // if( car[i] != null ) { ... print it ... }
    }

    /*
     * This method only reads a String that here, will be the rgn
     * of a car that you want to use
     * (for printing, driving, filling gas, etc.)
     */
    public String readCarRgn() {
        return io.readLine("Type rgn of car to use: ");
    }
    public void drive() {
        String carRgn = readCarRgn();
        Car foundCar = retrieveCar(carRgn);

        //TODO: write code for the following logic:
        // 1. Read a double value for the amount of miles to be driven.
        // 2. IF the car was really found, drive(i.e. lower the gas level of the car) it.
        // 3. Print the message: "<car_rgn> new gas level is <car_gas_meter>"
        // 4. Remember to not allow changing the gas level to negative values.
    }

    public void fillGas() {

        String carRgn = readCarRgn();
        Car foundCar = retrieveCar(carRgn);

        //TODO: write code for the following logic:
        // 1. Read a double value for the amount of gas to be filled with.
        // 2. IF the car was really found, use the reference to increase the gas level (consider MAX_GAS_LEVEL so the gas level doesn't go beyond it).
        // 3. Print the message: "<car_rgn> new gas level is <car_gas_meter>"
        // 4. Remember to not allow changing the gas level to negative values.
    }

    public void repairCar() {
        String carRgn = readCarRgn();
        Car foundCar = retrieveCar(carRgn);

        //TODO: write code for the following logic:
        // 1. Read the car rgn and check if it exists.
        // 2. Read the machanic name and check if they exist.
        // 3. Read the machanic type and check if it matches the car classification.
        // 2. IF the car and the mechanic satisfy the conditions, use the reference to change the car status to Good and lower the quality value by 0.1.
        // 3. Print the message: "<car_rgn> new status is <car_status> and quality value <car_quality_value>"
        // 4. Remember to not allow changing the quality value to negative values.
    }
}
