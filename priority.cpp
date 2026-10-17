#include<iostream>
using namespace std;

int *pq;
int front=-1,rear=-1,size;

void enque(){
    int x,i;
    if(rear == size-1){
        cout<<"queue is overflow\n";
        return;
    }
    cout<<"Enter Element:";
    cin>>x;
    if(front ==-1){
        front=rear=0;
        pq[rear]=x;
        return;
    }
    for(i=rear;i>=front && pq[rear]<x;i--){
        pq[i+1]=pq[i];
        pq[i+1]=x;
        rear++; 
    }
}
void deque(){
    if(front == -1 || front>rear){
        cout<<"queue is empty\n";
        return;
    }
    cout<<"Deleted:"<<pq[front++]<<endl;
}
void dispaly(){
    if(front == -1 || front>rear){
        cout<<"queue is empty\n";
        return;
    }
    for(int i=front;i<=rear;i++){
        cout<<pq[i]<<"  ";
    }
}
int main(){
    int ch;
    cout<<"Enter size of queue";
    cin>>size;
    pq= new int[size];
     do{
        cout<<"\n1.Enque 2.deque 3.display 4.exit:\n";
        cin>>ch;
        switch (ch)
        {
        case 1: enque();
            break;
        case 2: deque();
            break;
        case 3: dispaly();
            break;
        case 4:cout<<"Exit\n";
            break;
        default:
            cout<<"Invalid Choice";
            break;
        }

    }while (ch !=4); 
}