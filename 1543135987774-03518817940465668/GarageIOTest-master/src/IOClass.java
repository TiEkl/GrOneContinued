import com.sun.org.apache.xpath.internal.SourceTree;

import java.io.IOException;
import java.util.Scanner;

public class IOClass {

    private Scanner sc;
    private final String END_OF_LINE = System.lineSeparator();

    public IOClass(){
        sc = new Scanner(System.in);
    }

    public String readLine(String requestString){
        System.out.println(requestString);
        return sc.nextLine();
    }

    public double readDouble(String requestDouble){
        System.out.println(requestDouble);
        double banana = sc.nextDouble();
        sc.nextLine();
        return banana;
    }

    public int readInteger(String requestInteger){
        System.out.println(requestInteger);
        int banana = sc.nextInt();
        sc.nextLine();
        return banana;
    }

    public String gasTankEmptyError(String rgn){
        return "Error when driving car " + rgn +". Gas tank is empty.";
    }

    public int menu(){
        System.out.println(
                "Choose an option" + END_OF_LINE
                + "1. Register car" + END_OF_LINE
                + "2. Print all registered" + END_OF_LINE
                + "4. Print cheapest of classicifcation" + END_OF_LINE
                + "3. Print specific car (rgn)" + END_OF_LINE
                + "5. Test drive (rgn)" + END_OF_LINE
                + "6. Fill gas (rgn and gallons)" + END_OF_LINE
                + "7. Hire mechanic" + END_OF_LINE
                + "8. Repair a car" + END_OF_LINE
                + "9. Quit the application"+END_OF_LINE
                + END_OF_LINE
                + "Enter an option: "
        );
        int option = sc.nextInt();
        sc.nextLine();
        return option;
    }

    public void writeLine(String outputToUser){
        System.out.println(outputToUser);
    }

}
