#include<iostream>
using namespace std;

void bubblesort(int arr[],int n){
    bool isswap=false;
    for (int i = 0; i < n-1; i++)
    {
        for (int j = 0; j <n-i-1; j++)
        {
            if(arr[j]>arr[j+1]){
                swap(arr[j],arr[j+1]);
                isswap=true;
            }
        }
        
    }

    if(!isswap){
        return;
    }
}

void selectionsort(int arr[],int n){
    for (int i = 0; i < n-1; i++)
    {
        int s=i;
        for (int j = i+1; j < n; j++)
        {
            if(arr[j]<arr[s]){
                s=j;
            }
        }
        swap(arr[i],arr[s]);
    }
    
}

void print(int arr[],int n){
    for(int i=0;i<n;i++){
        cout<<arr[i];
    }
}

int main(){
    int n,arr[100];
    cout<<"enter n:";
    cin>>n;
    cout<<"Enter element in array :";
    for(int i=0;i<n;i++){
        cin>>arr[i];
    }
    cout<<"array:";
    for (int i = 0; i < n; i++)
    {
        cout<<arr[i];
    }
    cout<<"\n Sorted Array:"<<endl;
    bubblesort(arr,n);
    print(arr,n);
    cout<<endl;
    selectionsort(arr,n);
    print(arr,n);
    return 0;
}