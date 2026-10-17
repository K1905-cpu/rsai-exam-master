#include<iostream>
using namespace std;

int paration(int arr[],int st,int end){
    int idx = st-1;
    int pivot = arr[end];

    for(int j=st;j<end;j++){

        if(arr[j]<=pivot){
        idx++;
        swap(arr[j],arr[idx]);
        }
    }
    idx++;
    swap(arr[end],arr[idx]);
    return idx;
}

void quicksort(int arr[],int st,int end){
    if(st<end){
    int pivotidx = paration(arr,st,end);
    quicksort(arr,st,pivotidx-1);
    quicksort(arr,pivotidx+1,end);
    }
}

int main(){
    int arr[100],n;
    cout<<"Enter n:";
    cin>>n;
    cout<<"Enter Element in array:";
    for(int i=0;i<n;i++){
        cin>>arr[i];
    }
    cout<<"Array:";
    for (int i = 0; i < n; i++)
    {
        cout<<arr[i]<<"   ";
    }
    quicksort(arr,0,n-1);
    cout<<"\nSorted Array:";
     for (int i = 0; i < n; i++)
    {
        cout<<arr[i]<<"   ";
    }
    return 0;
}