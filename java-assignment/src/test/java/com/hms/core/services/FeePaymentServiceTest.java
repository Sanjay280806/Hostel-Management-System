package com.hms.core.services;

import com.hms.core.models.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class FeePaymentServiceTest {

    private FeePaymentService feePaymentService;

    @BeforeEach
    void setUp() {
        feePaymentService = new FeePaymentService();
    }

    @Test
    void testProcessPayment_SuccessfulPayment() {
        Student student = new Student("S201", true, 5000.0);
        
        boolean result = feePaymentService.processPayment(student, 2000.0);
        
        assertTrue(result, "Payment should be processed successfully");
        assertEquals(3000.0, student.getOutstandingBalance(), 0.01, "Outstanding balance should be reduced by payment amount");
    }

    @Test
    void testProcessPayment_ZeroAmount() {
        Student student = new Student("S202", true, 5000.0);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            feePaymentService.processPayment(student, 0.0);
        });
        
        assertEquals("Payment amount must be greater than zero.", exception.getMessage());
    }

    @Test
    void testProcessPayment_NegativeAmount() {
        Student student = new Student("S203", true, 5000.0);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            feePaymentService.processPayment(student, -500.0);
        });
        
        assertEquals("Payment amount must be greater than zero.", exception.getMessage());
    }

    @Test
    void testProcessPayment_AmountExceedsBalance() {
        Student student = new Student("S204", true, 1000.0);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            feePaymentService.processPayment(student, 2000.0);
        });
        
        assertEquals("Payment amount exceeds outstanding balance.", exception.getMessage());
    }
}
