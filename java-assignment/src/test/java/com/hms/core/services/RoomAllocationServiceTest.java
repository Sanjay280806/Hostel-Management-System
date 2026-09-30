package com.hms.core.services;

import com.hms.core.models.Room;
import com.hms.core.models.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RoomAllocationServiceTest {

    private RoomAllocationService roomAllocationService;

    @BeforeEach
    void setUp() {
        roomAllocationService = new RoomAllocationService();
    }

    @Test
    void testAllocateRoom_SuccessfulAllocation() {
        Student student = new Student("S101", false, 0.0);
        Room room = new Room("R101", 2, 0);

        boolean result = roomAllocationService.allocateRoom(student, room);

        assertTrue(result, "Room allocation should be successful");
        assertTrue(student.hasActiveAllocation(), "Student should have an active allocation");
        assertEquals(1, room.getOccupiedCount(), "Room occupied count should increment by 1");
    }

    @Test
    void testAllocateRoom_StudentAlreadyAllocated() {
        Student student = new Student("S102", true, 0.0);
        Room room = new Room("R102", 2, 0);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            roomAllocationService.allocateRoom(student, room);
        });

        assertEquals("Student already has an active room allocation.", exception.getMessage());
    }

    @Test
    void testAllocateRoom_RoomFullCapacity() {
        Student student = new Student("S103", false, 0.0);
        Room room = new Room("R103", 2, 2);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            roomAllocationService.allocateRoom(student, room);
        });

        assertEquals("Room is already at full capacity.", exception.getMessage());
    }

    @Test
    void testVacateRoom_SuccessfulVacation() {
        Student student = new Student("S104", true, 0.0);
        Room room = new Room("R104", 2, 1);

        boolean result = roomAllocationService.vacateRoom(student, room);

        assertTrue(result, "Vacating room should be successful");
        assertFalse(student.hasActiveAllocation(), "Student should no longer have an active allocation");
        assertEquals(0, room.getOccupiedCount(), "Room occupied count should decrement by 1");
    }

    @Test
    void testVacateRoom_StudentNotAllocated() {
        Student student = new Student("S105", false, 0.0);
        Room room = new Room("R105", 2, 1);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            roomAllocationService.vacateRoom(student, room);
        });

        assertEquals("Student does not have an active allocation to vacate.", exception.getMessage());
    }
}
