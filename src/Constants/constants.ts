export class Constants {

    /* Enforce a minimum number of instances that must reach a leaf
    node during training to preserve the leaf */
    // Default: False
    public static useMinInstancePruning: boolean = false;

    // Minimum of X instances necessary per leaf
    // Default: 2
    public static minInstancesPerLeaf: number = 2;

    // Z-value for confidence interval calculations
    // Default: Using z=0.69 for 75-th percentile estimate
    public static zValue: number = 0.69;

}
