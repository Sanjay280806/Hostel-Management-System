package com.hms.core.services;

import com.hms.core.models.Complaint;
import com.hms.core.models.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ComplaintServiceTest {

    private ComplaintService complaintService;
    private Student student;

    @BeforeEach
    void setUp() {
        complaintService = new ComplaintService();
        student = new Student("S301", true, 0.0);
    }

    @Test
    void testFileComplaint_Success() {
        Complaint complaint = complaintService.fileComplaint(student, "Leaking tap in room");
        
        assertNotNull(complaint, "Complaint should not be null");
        assertNotNull(complaint.getId(), "Complaint ID should be generated");
        assertEquals("S301", complaint.getStudentId(), "Student ID should match");
        assertEquals("PENDING", complaint.getStatus(), "Initial status should be PENDING");
    }

    @Test
    void testFileComplaint_EmptyDescription() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            complaintService.fileComplaint(student, "   ");
        });
        
        assertEquals("Complaint description cannot be empty", exception.getMessage());
    }

    @Test
    void testResolveComplaint_Success() {
        Complaint complaint = complaintService.fileComplaint(student, "Internet issue");
        String complaintId = complaint.getId();
        
        boolean result = complaintService.resolveComplaint(complaintId);
        
        assertTrue(result, "Complaint should be resolved successfully");
        assertEquals("RESOLVED", complaint.getStatus(), "Complaint status should be updated to RESOLVED");
    }

    @Test
    void testResolveComplaint_NotFound() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            complaintService.resolveComplaint("invalid-id");
        });
        
        assertEquals("Complaint not found", exception.getMessage());
    }

    @Test
    void testResolveComplaint_AlreadyResolved() {
        Complaint complaint = complaintService.fileComplaint(student, "Noise issue");
        String complaintId = complaint.getId();
        
        complaintService.resolveComplaint(complaintId); // Resolve first time
        
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            complaintService.resolveComplaint(complaintId); // Attempt to resolve again
        });
        
        assertEquals("Complaint is already resolved", exception.getMessage());
    }
}
