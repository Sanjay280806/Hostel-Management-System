package com.hms.core.services;

import com.hms.core.models.Student;

public class FeePaymentService {

    public boolean processPayment(Student student, double amount) {
        if (student == null) {
            throw new IllegalArgumentException("Student cannot be null");
        }

        if (amount <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero.");
        }

        if (amount > student.getOutstandingBalance()) {
            throw new IllegalArgumentException("Payment amount exceeds outstanding balance.");
        }

        double newBalance = student.getOutstandingBalance() - amount;
        student.setOutstandingBalance(newBalance);
        
        return true;
    }
}
