package com.hms.core.models;

public class Room {
    private String roomId;
    private int capacity;
    private int occupiedCount;

    public Room(String roomId, int capacity, int occupiedCount) {
        this.roomId = roomId;
        this.capacity = capacity;
        this.occupiedCount = occupiedCount;
    }

    public String getRoomId() { return roomId; }
    public int getCapacity() { return capacity; }
    public int getOccupiedCount() { return occupiedCount; }
    
    public void incrementOccupancy() {
        this.occupiedCount++;
    }
    
    public void decrementOccupancy() {
        if(this.occupiedCount > 0) this.occupiedCount--;
    }
}
