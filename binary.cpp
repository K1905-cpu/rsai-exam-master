#include<iostream>
using namespace std;

int main(){
    int n,arr[100],key;
    int st,end,mid;

    cout<<"Enter n:";
    cin>>n;
    cout<<"Enter Element:";
    for(int i=0;i<n;i++){
        cin>>arr[i];
    }
    cout<<"Array:";
     for(int i=0;i<n;i++){
        cout<<arr[i];
    }
    cout<<"\nEnter Key to found:";
    cin>>key;

    st = 0;
    end= n-1;
    
    while(st<=end){
        mid = (st+end)/2;
       
            if(arr[mid]==key){
                cout<<"Element found at position :"<<mid+1;
                return 0;
            }
            else if(key<arr[mid]){
                end = mid-1;
            }
            else{
                st = mid+1;
            }
    }
    cout<<"Elemnt not found";
    return 0;
}