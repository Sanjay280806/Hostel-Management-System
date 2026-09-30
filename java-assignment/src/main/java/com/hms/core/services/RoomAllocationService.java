package com.hms.core.services;

import com.hms.core.models.Room;
import com.hms.core.models.Student;

public class RoomAllocationService {

    public boolean allocateRoom(Student student, Room room) {
        if (student == null || room == null) {
            throw new IllegalArgumentException("Student and Room cannot be null");
        }

        if (student.hasActiveAllocation()) {
            throw new IllegalStateException("Student already has an active room allocation.");
        }

        if (room.getOccupiedCount() >= room.getCapacity()) {
            throw new IllegalStateException("Room is already at full capacity.");
        }

        room.incrementOccupancy();
        student.setHasActiveAllocation(true);
        return true;
    }

    public boolean vacateRoom(Student student, Room room) {
        if (student == null || room == null) {
            throw new IllegalArgumentException("Student and Room cannot be null");
        }

        if (!student.hasActiveAllocation()) {
            throw new IllegalStateException("Student does not have an active allocation to vacate.");
        }

        room.decrementOccupancy();
        student.setHasActiveAllocation(false);
        return true;
    }
}
