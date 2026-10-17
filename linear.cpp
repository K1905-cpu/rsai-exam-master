#include<iostream>
using namespace std;

int main(){
    int n,arr[100],f;
    bool found = false;

    cout<<"Enter no element in array:";
    cin>>n;

    cout<<"Enter Element in array:";
    for(int i=0;i<n;i++){
        cin>>arr[i];
    }
    
    cout<<endl<<"array:";
    for(int i=0;i<n;i++){
        cout<<arr[i];
    }

    cout<<"Enter Value you want found from array:";
    cin>>f;

    for(int i=0;i<n;i++){
        if(arr[i]==f){
            cout<<"Found element on index number"<<i<<"."<<endl;
            cout<<"Found element at position no."<<i+1<<".";
            found = true;
            break;
        }
    }

    if (!found)
    {
        cout<<"Element is not found";
    }
    

    return 0;
}