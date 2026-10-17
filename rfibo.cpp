#include<iostream>
using namespace std;

int fibon(int n){
    if(n==0)
        return 0;
    
    if(n==1)
        return 1;

    return fibon(n-1)+fibon(n-2);
}

int main(){
    int n;
    cout<<"Enter numer:";
    cin>>n;
    cout<<"fibonacchi of "<<n<<" is"<<endl;
    for(int i=0;i<n;i++){
        cout<<fibon(i);
    }
    return 0;
}