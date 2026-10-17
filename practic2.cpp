#include<iostream>
using namespace std;
int main(){
    int arr[100],n,ch,pos,value;
    cout<<"Enter Size of arrary:";
    cin>>n;
    for(int i=0;i<n;i++){
    cout<<"Enter element for "<<i<<"  index:";
    cin>>arr[i];
    }
    cout<<"Your array :"<<endl;
    for(int i=0;i<n;i++){

        cout<<arr[i]<<" ";
    }
    cout<<"Enter 1 for insertion and 2 for deletion:";
    cin>>ch;
    if(ch == 1){
        cout<<"Enter which position you can insert element "<<" (1 to "<<n+1<<" ) :";
        cin>>pos;
        cout<<"Enter value you can insert in array:";
        cin>>value;
        arr[pos]= value;
        arr[n]=arr[n]+arr[pos];
        for(int i=0;i<n;i++){
            cout<<arr[i]<<" ";
        }

    }
    else if(ch == 2){
        cout<<"Enter which position you can delete element :";
        cin>>pos;
        arr[n]=arr[n] - arr[pos];
        for(int i=0;i<n-1;i++){
            cout<<arr[i];
        }
    }
    else{
        cout<<"hfsd";
    }
    return 0;
}
