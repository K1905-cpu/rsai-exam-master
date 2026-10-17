#include<iostream>
using namespace std;

void toh(int n,char src,char spare,char dest){
    if(n==1){
        cout<<"Move disk 1 from "<<src<<" to "<<dest<<endl;
        return;
    }
    else{
        toh(n-1,src,dest,spare);
        cout<<"Move disk "<<n<<" from "<<src<<" to "<<dest<<endl;
        toh(n-1,spare,src,dest);
    }
}

int main(){
    int n;
    char s,d,sh;
    cout<<"Enter n:";
    cin>>n;
    cout<<"Enter Src:";
    cin>>s;
    cout<<"Enter spare:";
    cin>>sh;
    cout<<"Enter dest:";
    cin>>d;
    toh(n,s,sh,d);
}