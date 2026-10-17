#include<iostream>
using namespace std;


int *q;
int front=-1,rear=-1,SIZE;

void enque(){
    int x;
    if(rear==SIZE-1){
        cout<<"Queue is Oveflow";
        return;
    }
    cout<<"Enter Element:";
    cin>>x;
    if(front == -1){
        front =0;
    }
    q[++rear]=x;
}
void deque(){
    if(front == -1|| front>rear){
        cout<<"Queue is underflow";
        return;
    }
    cout<<"Deleted:"<<q[front++]<<endl;
}
void display(){
    if(front == -1|| front>rear){
        cout<<"Queue is empty";
        return;
    }
    for(int i=front;i<=rear;i++){
        cout<<q[i]<<" ";
    }
}
int main(){
    int ch;
     cout << "Enter size of deque: ";
    cin >> SIZE;
    q = new int[SIZE];

    do{
        cout<<"\n1.Enque 2.deque 3.display 4.exit:\n";
        cin>>ch;
        switch (ch)
        {
        case 1: enque();
            break;
        case 2: deque();
            break;
        case 3: display();
            break;
        case 4:cout<<"Exit\n";
            break;
        default:
            cout<<"Invalid Choice";
            break;
        }

    }while (ch !=4);
   
    
    return 0;
}