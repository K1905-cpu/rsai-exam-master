#include<iostream>
using namespace std;
int main(){
 int arr1[2][2];
 int arr2[2][2],arr3[2][2],c[2][2];
 cout<<"Enter  Value for matrix 1:";
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        cin>>arr1[i][j];
    }
 }
 cout<<"Matrix 1 is:"<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        cout<<arr1[i][j]<<"\t ";
    }
    cout<<endl;
 }

 cout<<"Enter  Value for matrix 2:";
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        cin>>arr2[i][j];
    }
 }
 cout<<"Matrix 2 is:"<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        cout<<arr2[i][j]<<"\t";
    }
    cout<<endl;
 }
 cout<<"Sum of Matrix 1 and Matrix 2: "<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        arr3[i][j] = arr1[i][j] + arr2[i][j];
        cout<<arr3[i][j]<<"\t";
    }
    cout<<endl;
 }
 cout<<"Substraction of Matrix 1 and Matrix 2: "<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        arr3[i][j] = arr1[i][j] - arr2[i][j];
        cout<<arr3[i][j]<<"\t";
    }
    cout<<endl;
 }
 cout<<"Multiplication of Matrix 1 and Matrix 2: "<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
            for(int k=0;k<2;k++){
        arr3[i][j] += arr1[i][k] * arr2[k][j];
            }
    }

 }
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        c[j][i] =arr1[i][j];
          cout<<arr3[i][j]<<"\t";
    }
    cout<<endl;
 }
 cout<<"Transponse of Matrix 1 is:"<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        c[j][i] =arr1[i][j];
         cout<<c[i][j]<<"\t";
    }
    cout<<endl;
 }
 cout<<"Transponse of Matrix 2 is:"<<endl;
 for(int i=0;i<2;i++){
    for(int j=0;j<2;j++){
        c[j][i] =arr2[i][j];
         cout<<c[i][j]<<"\t";
    }
    cout<<endl;
 }

 return 0;

}
