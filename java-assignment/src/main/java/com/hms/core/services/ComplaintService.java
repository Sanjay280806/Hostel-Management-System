package com.hms.core.services;

import com.hms.core.models.Complaint;
import com.hms.core.models.Student;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ComplaintService {
    
    private Map<String, Complaint> complaintDb = new HashMap<>();

    public Complaint fileComplaint(Student student, String description) {
        if (student == null) {
            throw new IllegalArgumentException("Student cannot be null");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint description cannot be empty");
        }

        String complaintId = UUID.randomUUID().toString();
        Complaint complaint = new Complaint(complaintId, student.getStudentId(), description);
        complaintDb.put(complaintId, complaint);
        return complaint;
    }

    public boolean resolveComplaint(String complaintId) {
        if (complaintId == null || complaintId.trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint ID cannot be empty");
        }

        Complaint complaint = complaintDb.get(complaintId);
        if (complaint == null) {
            throw new IllegalArgumentException("Complaint not found");
        }

        if ("RESOLVED".equals(complaint.getStatus())) {
            throw new IllegalStateException("Complaint is already resolved");
        }

        complaint.setStatus("RESOLVED");
        return true;
    }
    
    public Complaint getComplaint(String complaintId) {
        return complaintDb.get(complaintId);
    }
}
