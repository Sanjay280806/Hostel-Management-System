package com.hms.core.models;

public class Complaint {
    private String id;
    private String studentId;
    private String description;
    private String status;

    public Complaint(String id, String studentId, String description) {
        this.id = id;
        this.studentId = studentId;
        this.description = description;
        this.status = "PENDING";
    }

    public String getId() { return id; }
    public String getStudentId() { return studentId; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    
    public void setStatus(String status) { this.status = status; }
}
