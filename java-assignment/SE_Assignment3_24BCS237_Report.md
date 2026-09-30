# SOFTWARE ENGINEERING
## ASSIGNMENT 3 – UNIT TESTING 
### JUnit 5 • Test Design 

**Student Name:** Samuthrika Shree S  
**Roll No:** 24BCS237  
**Date:** 28-09-2026  

---

### Activity 1 – Select Core Modules for Testing

| Module / Class | Purpose | Key Methods / Behaviours | Reason for Selection |
| :--- | :--- | :--- | :--- |
| **RoomAllocationService** | Manages the allocation and vacating of rooms for students. | `allocateRoom()`, `vacateRoom()` | Core business logic that enforces room capacity rules and ensures students can only be allocated one room at a time. |
| **FeePaymentService** | Processes student fee payments. | `processPayment()` | Critical financial logic that prevents zero/negative payments and prevents students from paying more than their outstanding balance. |
| **ComplaintService** | Tracks student complaints and their resolution status. | `fileComplaint()`, `resolveComplaint()` | Essential workflow logic that ensures complaints are properly tracked and prevents duplicate resolution actions. |

---

### Activity 2 – Configure JUnit 5

**Dependencies Added (pom.xml):**
```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
```

**Project Structure:**
```text
java-assignment/
├── pom.xml
├── src/
│   ├── main/java/com/hms/core/
│   │   ├── models/ (Room.java, Student.java, Complaint.java)
│   │   └── services/
│   │       ├── RoomAllocationService.java
│   │       ├── FeePaymentService.java
│   │       └── ComplaintService.java
│   └── test/java/com/hms/core/services/
│       ├── RoomAllocationServiceTest.java
│       ├── FeePaymentServiceTest.java
│       └── ComplaintServiceTest.java
```

---

### Activity 3 – Write Unit Tests for Three Core Modules

#### Module 1: RoomAllocationService
**Test Requirements Met:** Normal successful allocation, edge case (room full), and exceptional behavior (student already allocated).
*(See attached source code in `java-assignment/src/test/java/.../RoomAllocationServiceTest.java`)*

#### Module 2: FeePaymentService
**Test Requirements Met:** Normal successful payment, edge cases (zero/negative payments), and invalid input (payment exceeding balance).
*(See attached source code in `java-assignment/src/test/java/.../FeePaymentServiceTest.java`)*

#### Module 3: ComplaintService
**Test Requirements Met:** Normal complaint filing and resolution, boundary conditions (resolving already resolved complaint), and invalid input (non-existent complaint ID).
*(See attached source code in `java-assignment/src/test/java/.../ComplaintServiceTest.java`)*

---

### Activity 4 – Execute Tests and Debug Failures

**Execution Summary:**
- **Tests Executed:** 14
- **Passed:** 14
- **Failed:** 0

*No debugging was required as all tests passed successfully upon initial execution, verifying the correctness of the business logic.*

---

### Activity 6 – Test Case Summary

| Test ID | Module | Scenario / Purpose | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T1 | RoomAllocation | Successful room allocation | Room occupied count increments, student status updates | As expected | Pass |
| T2 | RoomAllocation | Student already allocated | Throws IllegalStateException | As expected | Pass |
| T3 | RoomAllocation | Room is at full capacity | Throws IllegalStateException | As expected | Pass |
| T4 | RoomAllocation | Successful vacating of room | Room count decrements, student status updates | As expected | Pass |
| T5 | RoomAllocation | Vacating without active allocation | Throws IllegalStateException | As expected | Pass |
| T6 | FeePayment | Successful fee payment | Outstanding balance reduces correctly | As expected | Pass |
| T7 | FeePayment | Payment with zero amount | Throws IllegalArgumentException | As expected | Pass |
| T8 | FeePayment | Payment with negative amount | Throws IllegalArgumentException | As expected | Pass |
| T9 | FeePayment | Payment exceeds balance | Throws IllegalArgumentException | As expected | Pass |
| T10 | Complaint | Successful complaint filing | Complaint generated with PENDING status | As expected | Pass |
| T11 | Complaint | Filing with empty description | Throws IllegalArgumentException | As expected | Pass |
| T12 | Complaint | Successful complaint resolution | Status updates to RESOLVED | As expected | Pass |
| T13 | Complaint | Resolving invalid complaint ID | Throws IllegalArgumentException | As expected | Pass |
| T14 | Complaint | Resolving already resolved complaint | Throws IllegalStateException | As expected | Pass |

---

### Reflection

**Why is unit testing performed before higher levels of testing?**
**Answer:** Unit testing isolates the smallest pieces of testable code (modules/functions) to ensure they function correctly on their own. Finding and fixing bugs at this stage is much cheaper and faster than during integration or system testing, where issues are harder to trace back to the root cause.

**How did you decide which three modules were core modules in your mini project?**
**Answer:** I reviewed the main functional requirements (SRS document) of the Hostel Management System and identified the most critical business rules. Room allocation, fee payments, and complaint tracking involve the most complex state changes and validations, making them the most important components to test.

**Which test case was most useful in identifying a defect or edge case? Explain.**
**Answer:** The `testProcessPayment_AmountExceedsBalance` test was highly useful. It ensured that the system actively rejects payments larger than what the student owes, which prevents negative balance logical errors and potential financial calculation issues in the database.

**What did you do when a unit test failed?**
**Answer:** During initial development (TDD process), if a test failed, I first checked the test case to ensure my assertions and expected results were correct. Once the test was verified, I analyzed the failing source code logic, pinpointed the error using the stack trace, corrected the condition or assignment, and then re-ran the test suite until it passed.
