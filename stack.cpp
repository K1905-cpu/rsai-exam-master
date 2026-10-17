#include<iostream>
using namespace std;


int *stcak;
int top=-1,Max;

void push(){
    int val;
    if(top == Max-1){
        cout<<"The Stack is Full you can't  push value\n";
    }
    else{
        cout<<"Enter Element:";
        cin>>val;
        ++top;
        stcak[top]=val;
        cout<<"Value enter sucssfully!";
    }
}

void pop(){
    if(top==-1){
        cout<<"The stack is empty!";
    }
    else{
        cout<<"Poped element"<<stcak[top]<<endl;
        top--;
    }
}
void peep(){
    if(top == -1){
        cout<<"The stack is empty!";
    }
    else{
        cout<<"Top element is :"<<stcak[top]<<endl;
    }
}
void display(){
    if(top==-1){
        cout<<"Stack is empty!";
    }
    cout<<"Stack Element ";
    for (int i = top; i >=0; i--)
    {
       cout<<stcak[i]<<endl;
    }
    
}
int main(){
    int ch;
    cout << "Enter size of deque: ";
    cin >> Max;

    stcak = new int[Max];

    do{
        cout<<"1.push\n2.pop\n3.peep\n4.display\n5.exit:";
        cin>>ch;
    
    
        switch (ch)
        {
        case 1:push();
            break;
        case 2: pop();
            break;
        case 3: peep();
            break;
        case 4:display();
            break;
        case 5:cout<<"EXIT !"<<endl;
            break;
        default:cout<<"Invalid choice!";
            break;
        }
    } while (ch !=5);
    
   
    return 0;
}