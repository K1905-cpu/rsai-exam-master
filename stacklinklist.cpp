#include<iostream>
using namespace std;

struct Node {
    int data;
    Node *next;
};

Node *top = NULL;

void push() {
    int x;
    Node *newNode = new Node;

    if (newNode == NULL) {
        cout << "Stack overflow (heap full)\n";
        return;
    }

    cout << "Enter element: ";
    cin >> x;

    newNode->data = x;
    newNode->next = top;
    top = newNode;

    cout << "Value pushed successfully\n";
}

void pop() {
    if (top == NULL) {
        cout << "Stack underflow (empty stack)\n";
        return;
    }

    Node *temp = top;
    cout << "Popped element: " << temp->data << endl;
    top = top->next;
    delete temp;
}

void peep() {
    if (top == NULL) {
        cout << "Stack is empty\n";
        return;
    }
    cout << "Top element: " << top->data << endl;
}

void display() {
    if (top == NULL) {
        cout << "Stack is empty\n";
        return;
    }

    Node *temp = top;
    cout << "Stack elements:\n";
    while (temp != NULL) {
        cout << temp->data << endl;
        temp = temp->next;
    }
}

int main() {
    int ch;
    do {
        cout << "\n1.Push\n2.Pop\n3.Peep\n4.Display\n5.Exit\n";
        cout << "Enter choice: ";
        cin >> ch;

        switch (ch) {
            case 1: push(); break;
            case 2: pop(); break;
            case 3: peep(); break;
            case 4: display(); break;
            case 5: cout << "EXIT\n"; break;
            default: cout << "Invalid choice\n";
        }
    } while (ch != 5);

    return 0;
}