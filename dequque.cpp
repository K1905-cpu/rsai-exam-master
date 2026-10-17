#include<iostream>
using namespace std;

int *dq;
int front = -1, rear = -1, n;

void enqueueLeft() {
    int x;
    if(front == 0) {
        cout << "Overflow at left\n";
        return;
    }
    cout << "Enter element: ";
    cin >> x;

    if(front == -1)
        front = rear = 0;
    else
        front--;

    dq[front] = x;
}

void enqueueRight() {
    int x;
    if(rear == n - 1) {
        cout << "Overflow at right\n";
        return;
    }
    cout << "Enter element: ";
    cin >> x;

    if(front == -1)
        front = rear = 0;
    else
        rear++;

    dq[rear] = x;
}

void dequeueLeft() {
    if(front == -1 || front > rear) {
        cout << "Deque is empty\n";
        return;
    }
    cout << "Deleted from left: " << dq[front++] << endl;
}

void dequeueRight() {
    if(front == -1 || front > rear) {
        cout << "Deque is empty\n";
        return;
    }
    cout << "Deleted from right: " << dq[rear--] << endl;
}

void display() {
    if(front == -1 || front > rear) {
        cout << "Deque is empty\n";
        return;
    }
    for(int i = front; i <= rear; i++)
        cout << dq[i] << " ";
    cout << endl;
}

int main() {
    int choice;
    cout << "Enter size of deque: ";
    cin >> n;
    dq = new int[n];

    do {
        cout << "\n1.Enqueue Left\n2.Enqueue Right\n3.Dequeue Left\n4.Dequeue Right\n5.Display\n6.Exit\n";
        cin >> choice;

        switch(choice) {
            case 1: enqueueLeft(); break;
            case 2: enqueueRight(); break;
            case 3: dequeueLeft(); break;
            case 4: dequeueRight(); break;
            case 5: display(); break;
            case 6: cout << "Exit\n"; break;
            default: cout << "Invalid choice\n";
        }
    } while(choice != 6);

    return 0;
}