#include <iostream>
using namespace std;

int main() {
    // 3D Arrays: 3 Layers, 3 Rows, 3 Columns
    int arr1[3][3][3], arr2[3][3][3], res[3][3][3], trans[3][3][3];

    // Input for 3D Array 1
    cout << "Enter values for 3D Array 1 (27 values):" << endl;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            for (int k = 0; k < 3; k++) {
                cin >> arr1[i][j][k];
            }
        }
    }

    // Input for 3D Array 2
    cout << "Enter values for 3D Array 2 (27 values):" << endl;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            for (int k = 0; k < 3; k++) {
                cin >> arr2[i][j][k];
            }
        }
    }

    // --- 1. Addition ---
    cout << "\nSum of 3D Arrays:" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "Layer " << i << ":" << endl;
        for (int j = 0; j < 3; j++) {
            for (int k = 0; k < 3; k++) {
                res[i][j][k] = arr1[i][j][k] + arr2[i][j][k];
                cout << res[i][j][k] << "\t";
            }
            cout << endl;
        }
    }

    // --- 2. Subtraction ---
    cout << "\nSubtraction of 3D Arrays:" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "Layer " << i << ":" << endl;
        for (int j = 0; j < 3; j++) {
            for (int k = 0; k < 3; k++) {
                res[i][j][k] = arr1[i][j][k] - arr2[i][j][k];
                cout << res[i][j][k] << "\t";
            }
            cout << endl;
        }
    }

    // --- 3. Multiplication (Layer-wise) ---
    // Multiplies Matrix[i] of arr1 with Matrix[i] of arr2
    cout << "\nMultiplication (Layer-wise):" << endl;
    for (int i = 0; i < 3; i++) { // For each layer
        cout << "Result Layer " << i << ":" << endl;
        for (int j = 0; j < 3; j++) { // Row of arr1
            for (int k = 0; k < 3; k++) { // Col of arr2
                res[i][j][k] = 0; // Reset sum for this cell
                for (int m = 0; m < 3; m++) { // Dot product index
                    res[i][j][k] += arr1[i][j][m] * arr2[i][m][k];
                }
                cout << res[i][j][k] << "\t";
            }
            cout << endl;
        }
    }

    // --- 4. Transpose (Layer-wise) ---
    cout << "\nTranspose of 3D Array 1 (Each layer transposed):" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "Layer " << i << ":" << endl;
        for (int j = 0; j < 3; j++) {
            for (int k = 0; k < 3; k++) {
                trans[i][k][j] = arr1[i][j][k]; // Swap j and k (row/col)
            }
        }
        // Print the transposed layer
        for (int j = 0; j < 3; j++) {
            for (int k = 0; k < 3; k++) {
                cout << trans[i][j][k] << "\t";
            }
            cout << endl;
        }
    }

    return 0;
}
