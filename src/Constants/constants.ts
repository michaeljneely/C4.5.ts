export class Constants {

    // Minimum of two instances necessary per leaf
    public static minInstancesPerLeaf = 2;

    // Default 30%
    public static pruningSplit: number = 30;

    // Using z=0.69 for 75-th percentile estimate
    public static confidenceLevel: number = 0.69;

}
