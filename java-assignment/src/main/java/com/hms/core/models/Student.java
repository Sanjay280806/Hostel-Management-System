package com.hms.core.models;

public class Student {
    private String studentId;
    private boolean hasActiveAllocation;
    private double outstandingBalance;

    public Student(String studentId, boolean hasActiveAllocation, double outstandingBalance) {
        this.studentId = studentId;
        this.hasActiveAllocation = hasActiveAllocation;
        this.outstandingBalance = outstandingBalance;
    }

    public String getStudentId() { return studentId; }
    
    public boolean hasActiveAllocation() { return hasActiveAllocation; }
    public void setHasActiveAllocation(boolean hasActiveAllocation) { this.hasActiveAllocation = hasActiveAllocation; }
    
    public double getOutstandingBalance() { return outstandingBalance; }
    public void setOutstandingBalance(double outstandingBalance) { this.outstandingBalance = outstandingBalance; }
}
