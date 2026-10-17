#include<iostream>
using namespace std;

void merge(int arr[],int st,int mid,int end){
    int temp[100];
    int i=st,j= mid+1,k=0;
    while (i<=mid && j<=end)
    {
        if(arr[i]<=arr[j]){
            temp[k]=arr[i];
            i++;
        }
        else{
            temp[k]=arr[j];
            j++;
        }
        k++;
    }
    
    while (i<=mid)
    {
        temp[k]=arr[i];
        i++;
        k++;
    }
    while (j<=end)
    {
        temp[k]=arr[j];
        j++;
        k++;
    }
    for(int idx=0;idx<k;idx++){
        arr[st+idx]= temp[idx];
    }
}
void mergesort(int arr[],int st,int end){
    if(st<end){
        int mid=st+(end-st)/2;
        mergesort(arr,st,mid);
        mergesort(arr,mid+1,end);
        merge(arr,st,mid,end);
    }
}

int main(){
    int n,arr[100];
    cout<<"Enter n:";
    cin>>n;
    cout<<"Enter Array:";
    for (int i = 0; i < n; i++)
    {
        cin>>arr[i];
    }
    cout<<"Array:";
    for (int i = 0; i < n; i++)
    {
        cout<<arr[i];
    }
    
    mergesort(arr,0,n-1);
    cout<<"\nSorted Array:";
    for (int i = 0; i < n; i++)
    {
        cout<<arr[i];
    }
    return 0;
}