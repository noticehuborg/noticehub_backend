'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: 50 Announcements (25 × CS 300 + 25 × IT 200)
 *
 * Rule: Every announcement is authored ONLY by the course rep of that class.
 *   CS 300 authors → Schnelle | Jennifer | Eliah
 *   IT 200 authors → Kwabena  | Efua     | Nana
 *
 * Distribution per group:
 *   assignment — 10
 *   exams      —  7
 *   general    —  8
 *   ─────────────────
 *   total      — 25
 */

// Must match seeders/20240101000002-seed-users.js exactly
const USER_IDS = {
  // CS 300 Course Reps
  schnelle: '550e8400-e29b-41d4-a716-446655440001',
  jennifer: '550e8400-e29b-41d4-a716-446655440002',
  eliah:    '550e8400-e29b-41d4-a716-446655440003',
  // IT 200 Course Reps
  kwabena:  '550e8400-e29b-41d4-a716-446655440009',
  efua:     '550e8400-e29b-41d4-a716-446655440010',
  nana:     '550e8400-e29b-41d4-a716-446655440011',
  // CS 300 Lecturers
  asante:   '550e8400-e29b-41d4-a716-446655440004', // Dr. Kwame Asante
  mensah:   '550e8400-e29b-41d4-a716-446655440006', // Dr. Kofi Mensah
  darko:    '550e8400-e29b-41d4-a716-446655440008', // Prof. Yaw Darko
  // IT 200 Lecturers
  osei:     '550e8400-e29b-41d4-a716-446655440005', // Prof. Abena Osei-Bonsu
  boateng:  '550e8400-e29b-41d4-a716-446655440007', // Dr. Ama Boateng
};

module.exports = {
  async up(queryInterface) {
    const base     = new Date('2026-03-27T00:00:00Z');
    const ago      = (n) => new Date(base.getTime() - n * 86400000);
    const from     = (n) => new Date(base.getTime() + n * 86400000);
    const fixed    = (iso) => new Date(iso);

    // Verify all authors exist before inserting
    for (const [key, id] of Object.entries(USER_IDS)) {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE id = '${id}' LIMIT 1`
      );
      if (rows.length === 0) {
        throw new Error(`User '${key}' (${id}) not found. Run seeder 002 first.`);
      }
    }

    const A = [

      // ═══════════════════════════════════════════════════════════════════════
      // CS 300  ·  ASSIGNMENTS  (10)
      // ═══════════════════════════════════════════════════════════════════════

      {
        id: uuidv4(), author_id: USER_IDS.schnelle,
        title: 'B-Tree Assignment',
        body: `Topic: B-Tree

You are given the following keys:
2, 3, 10, 6, 4, 1, 25, 43, 35, 27, 90, 39, 46, 64, 29

Tasks:
(a) Construction: Draw a B-Tree of order 5 using the given keys.
(b) Insertion: Insert key 66 into the B-Tree and draw the resulting tree.
(c) Deletion: Delete key 43 from the ORIGINAL tree in (a), NOT from (b).

Show all intermediate steps. Submission is individual. Submit as PDF.`,
        category: 'assignment', course: 'Data Structures and Algorithms',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: true, pinned_at: ago(0),
        deadline: from(4), useful_links: JSON.stringify([]), view_count: 54,
        created_at: ago(0), updated_at: ago(0),
      },

      {
        id: uuidv4(), author_id: USER_IDS.asante,
        title: 'Railway Carriage Sorting Problem',
        body: `Problem Statement:
Three railway tracks T1(B), T2(C), T3(A) contain carriages that must be sorted into order A, B, C.

Tasks:
1. Algorithm Design: Describe a step-by-step algorithm to rearrange the carriages.
2. Complexity Analysis: Achieve O(n log n) — justify your approach.
3. Implementation: Code the solution in Java. Built-in sort methods (Arrays.sort, Collections.sort) are NOT allowed.

Submit source code + a brief written report as a single ZIP file.`,
        category: 'assignment', course: 'Data Structures and Algorithms',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(7), useful_links: JSON.stringify([]), view_count: 39,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.mensah,
        title: 'DSA — Abstract Data Types and Linear Structures',
        body: `Assignment: Abstract Data Types and Linear Structures

1. Define Abstract Data Type (ADT) in your own words. Why is abstraction important?

2. For each structure below, list and describe its core operations:
   - List, Linked List, Stack, Queue, Set

3. Given array: [a, b, c, d, e, f, g, h]
   Map it onto a binary tree and draw the result. Label nodes with array indices.

Submission: PDF only. Diagrams must be clearly labelled.`,
        category: 'assignment', course: 'Data Structures and Algorithms',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(3), useful_links: JSON.stringify([]), view_count: 31,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.darko,
        title: 'DSA Assignment — Stack Implementation and Inversion',
        body: `Implement a Stack for the integer sequence: [0, 2, -3, 7, 8, 10, 6, -7]

Tasks:
1. Implement using (a) Array-based and (b) Linked List-based approaches.
2. Perform the following and show the stack state after each step:
   (a) Negation — multiply every element by -1
   (b) Inversion — reverse the order of all elements
3. Compare time and space complexity of both implementations.

Language: Java or C++. Code must be well-commented.
Submission: Single .zip file via the student portal.`,
        category: 'assignment', course: 'Data Structures and Algorithms',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(2), useful_links: JSON.stringify([]), view_count: 47,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.mensah,
        title: 'CSM 353 — Programming Paradigms Assignment',
        body: `Implement the following in three paradigms:

1. Imperative (C): Bubble sort on [5, 3, 8, 1, 9, 2]
2. Functional (Haskell): Recursive factorial + higher-order list operations (filter, map)
3. Object-Oriented (Python):
   - BankAccount class with deposit(), withdraw(), get_balance()
   - SavingsAccount subclass with interest_rate attribute

For each implementation, write 150–200 words comparing how the paradigm shaped your design decisions.

Submission: PDF report + source files in a single ZIP.`,
        category: 'assignment', course: 'CSM 353 — Survey of Programming Languages',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(5), useful_links: JSON.stringify([]), view_count: 28,
        created_at: ago(0), updated_at: ago(0),
      },

      {
        id: uuidv4(), author_id: USER_IDS.darko,
        title: 'OOP — Design Patterns Assignment',
        body: `Select TWO Gang of Four design patterns and implement each in Java:

Options: Singleton | Observer | Factory Method | Decorator | Strategy

For each pattern:
1. Describe a real-world scenario where it applies.
2. Implement a working Java example (minimum 3 classes).
3. Draw a UML class diagram for your implementation.
4. Discuss advantages and trade-offs in your chosen scenario.

Submission: PDF report + .java files zipped together.`,
        category: 'assignment', course: 'Object-Oriented Programming',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(8), useful_links: JSON.stringify([]), view_count: 22,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.schnelle,
        title: 'Algorithm Design — Divide and Conquer',
        body: `Assignment: Divide and Conquer Techniques

1. Merge Sort: Implement merge sort in Python. Trace it step-by-step on: [38, 27, 43, 3, 9, 82, 10].

2. Binary Search: Implement iterative and recursive versions. Compare their space complexity.

3. Matrix Multiplication: Implement the Strassen algorithm. Compare its complexity against naive O(n³) multiplication.

4. Analysis: For each algorithm above, derive its recurrence relation and solve using the Master Theorem.

Submission: Python source files + written analysis (PDF).`,
        category: 'assignment', course: 'Algorithm Design and Analysis',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(10), useful_links: JSON.stringify([]), view_count: 19,
        created_at: ago(0), updated_at: ago(0),
      },

      {
        id: uuidv4(), author_id: USER_IDS.darko,
        title: 'Software Engineering — UML and System Modelling',
        body: `Assignment: UML Diagrams and System Modelling

You are building a simple Library Management System. Produce the following UML diagrams:

1. Use Case Diagram — identify all actors and use cases.
2. Class Diagram — at least 5 classes with attributes, methods, and relationships.
3. Sequence Diagram — model the "Borrow Book" use case end-to-end.
4. Activity Diagram — model the book return workflow.

Tools: StarUML, Lucidchart, draw.io, or any UML tool. Export as PDF.

Each diagram must include a short paragraph explaining the design decisions made.`,
        category: 'assignment', course: 'Software Engineering',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(6), useful_links: JSON.stringify([
          { label: 'draw.io (free)', url: 'https://draw.io' },
          { label: 'Lucidchart', url: 'https://lucidchart.com' },
        ]), view_count: 26,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.asante,
        title: 'Computer Networks — OSI Model and Protocol Analysis',
        body: `Assignment: OSI Model and Network Protocols

1. OSI Model: Describe each of the 7 layers. For each layer, name one protocol and explain its role.

2. TCP vs UDP: Compare the two transport-layer protocols. Give one real application scenario for each.

3. Packet Analysis: Using the provided Wireshark capture file (shared in Telegram group), identify:
   - Source and destination IP addresses
   - Protocol used at the transport layer
   - Any HTTP request/response headers visible

4. Subnetting: Given the network 192.168.10.0/24, divide it into 4 equal subnets. Show the subnet mask, network address, broadcast address, and usable host range for each.

Submission: PDF, typed. Wireshark screenshots may be embedded.`,
        category: 'assignment', course: 'Computer Networks',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(9), useful_links: JSON.stringify([]), view_count: 24,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.mensah,
        title: 'Operating Systems — Process Scheduling Algorithms',
        body: `Assignment: CPU Scheduling Algorithms

Given the following process table:
Process | Arrival Time | Burst Time
  P1    |      0       |     8
  P2    |      1       |     4
  P3    |      2       |     9
  P4    |      3       |     5

Tasks:
1. Draw Gantt charts for: FCFS, SJF (non-preemptive), Round Robin (quantum = 2), Priority (use burst time as priority, lower = higher priority).
2. For each algorithm, calculate: Average Waiting Time, Average Turnaround Time.
3. Which algorithm performs best for this workload? Justify your answer.

Submission: Typed PDF. Gantt charts may be hand-drawn and photographed clearly.`,
        category: 'assignment', course: 'Operating Systems',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(11), useful_links: JSON.stringify([]), view_count: 33,
        created_at: ago(0), updated_at: ago(0),
      },

      // ═══════════════════════════════════════════════════════════════════════
      // CS 300  ·  EXAMS  (7)
      // ═══════════════════════════════════════════════════════════════════════

      {
        id: uuidv4(), author_id: USER_IDS.asante,
        title: 'Data Structures & Algorithms — Mid-Semester Examination Notice',
        body: `Official Notice: DSA Mid-Semester Examination

All CS 300 students are reminded of the upcoming mid-semester exam.

Coverage:
- Arrays, Linked Lists, Stacks, Queues, Trees (Binary, BST, B-Tree)
- Sorting: Bubble, Insertion, Merge, Quick, Heap
- Graph algorithms: BFS, DFS, Dijkstra
- Big-O, Omega, Theta notation

Format: Section A (30 MCQ) + Section B (3 long questions)
Duration: 2 Hours 30 Minutes | Closed book

Students must bring their student ID. No electronic devices permitted.`,
        category: 'exams', course: 'Data Structures and Algorithms',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: true, pinned_at: ago(1),
        deadline: from(14), useful_links: JSON.stringify([]), view_count: 88,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.mensah,
        title: 'CSM 353 — End-of-Semester Examination Notice',
        body: `Examination Notice — CSM 353: Survey of Programming Languages

Coverage:
- Imperative / Procedural (C, Pascal)
- Object-Oriented (Java, Python, C++)
- Functional (Haskell, ML, Erlang)
- Logic Programming (Prolog)
- Scripting and Dynamic (Python, Ruby)

Format:
- Section A: 20 MCQ (20 marks)
- Section B: Short-answer — attempt 3 of 4 (45 marks)
- Section C: Comparative programming question (35 marks)

Duration: 3 Hours | Open-book: NO

Lecture notes and past papers available from the department on request.`,
        category: 'exams', course: 'CSM 353 — Survey of Programming Languages',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(20), useful_links: JSON.stringify([]), view_count: 71,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.schnelle,
        title: 'Algorithm Design & Analysis — Resit Examination',
        body: `RESIT EXAMINATION — Algorithm Design and Analysis

Students who did not pass the main examination are eligible to sit the resit. Check the results board for your status before registering.

Registration deadline: 1st April 2026 — Academic Affairs office (bring student ID + transcript copy).

Coverage: Same as the main examination (all 12 weeks)
Key areas:
- Divide and Conquer (merge sort, quicksort, binary search)
- Dynamic Programming (knapsack, LCS, matrix chain)
- Greedy Algorithms (Dijkstra, Kruskal, Prim's)
- NP-Completeness and problem reductions

Past papers: Available at the departmental office.`,
        category: 'exams', course: 'Algorithm Design and Analysis',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(15), useful_links: JSON.stringify([]), view_count: 42,
        created_at: ago(3), updated_at: ago(3),
      },

      {
        id: uuidv4(), author_id: USER_IDS.darko,
        title: 'Software Engineering — Final Examination Notice',
        body: `Final Examination — Software Engineering

All CS 300 students should note the upcoming final examination for Software Engineering.

Scope: Weeks 1–13 lecture notes + all lab exercises

Topics:
- SDLC models (Waterfall, Agile, Scrum, Spiral)
- Requirements Engineering (functional, non-functional, use cases)
- UML Diagrams (Use Case, Class, Sequence, Activity)
- Software Testing (unit, integration, system, acceptance)
- Design patterns (Creational, Structural, Behavioural)
- Software metrics and quality assurance

Duration: 3 Hours | Format: MCQ + Structured Questions`,
        category: 'exams', course: 'Software Engineering',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(22), useful_links: JSON.stringify([]), view_count: 59,
        created_at: ago(3), updated_at: ago(3),
      },

      {
        id: uuidv4(), author_id: USER_IDS.asante,
        title: 'Computer Networks — Mid-Semester Examination',
        body: `Mid-Semester Examination Notice — Computer Networks

Coverage:
- OSI and TCP/IP models: layers, protocols, functions
- Physical layer: signal types, bandwidth, Nyquist & Shannon theorems
- Data Link layer: framing, error detection (CRC, parity), MAC addressing
- Network layer: IP addressing, subnetting (CIDR), routing (RIP, OSPF)
- Transport layer: TCP vs UDP, port numbers, connection establishment

Duration: 1 Hour 30 Minutes | Closed book
Bring: Student ID and pens only.

Good luck! Review the subnetting exercises from lab sessions especially.`,
        category: 'exams', course: 'Computer Networks',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(13), useful_links: JSON.stringify([]), view_count: 65,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.mensah,
        title: 'Operating Systems — End-of-Semester Examination',
        body: `End-of-Semester Examination Notice — Operating Systems

Scope: All topics from Week 1 to Week 14

Key topics:
- Process management: states, PCB, context switching
- CPU Scheduling: FCFS, SJF, Round Robin, Priority, Multilevel Queue
- Memory management: paging, segmentation, virtual memory, page replacement (FIFO, LRU, Optimal)
- File systems: FAT, NTFS, inodes, directory structures
- Deadlocks: conditions, detection, avoidance (Banker's algorithm), prevention
- I/O management: disk scheduling (SSTF, SCAN, C-SCAN)

Format: Structured questions. Duration: 3 Hours.`,
        category: 'exams', course: 'Operating Systems',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(25), useful_links: JSON.stringify([]), view_count: 78,
        created_at: ago(4), updated_at: ago(4),
      },

      {
        id: uuidv4(), author_id: USER_IDS.darko,
        title: 'OOP — Practical Assessment Notice',
        body: `Object-Oriented Programming — Practical Assessment

This is a reminder that the OOP practical assessment will take place in the computer lab.

Format: You will be given a problem statement and 90 minutes to produce a working Java program.

Assessment areas:
- Class design and encapsulation
- Inheritance and polymorphism
- Interface implementation
- Exception handling
- Collection framework usage (ArrayList, HashMap, etc.)

Bring: Student ID. Lab computers will be provided. No USB drives or personal laptops.

Past practical questions have been shared in the class Telegram group.`,
        category: 'exams', course: 'Object-Oriented Programming',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(18), useful_links: JSON.stringify([]), view_count: 48,
        created_at: ago(2), updated_at: ago(2),
      },

      // ═══════════════════════════════════════════════════════════════════════
      // CS 300  ·  GENERAL  (8)
      // ═══════════════════════════════════════════════════════════════════════

      {
        id: uuidv4(), author_id: USER_IDS.eliah,
        title: 'Welcome to Semester 2 — CS 300',
        body: `Hi everyone 👋

Welcome back to Semester 2! A few things to note as we kick off:

1. All assignment deadlines and exam notices will be posted here on NoticeHub. Check it regularly.
2. Lecture schedules are on the department notice board — any changes will also be posted here.
3. The class Telegram group links are in a separate post below.
4. If you have any issues (wrong level, name errors on portal, etc.), come to me directly.

Let's have a great semester. Stay on top of the work early — the workload picks up fast.

— Eliah (CS 300 Course Rep)`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 134,
        created_at: ago(10), updated_at: ago(10),
      },

      {
        id: uuidv4(), author_id: USER_IDS.schnelle,
        title: 'Change of Lecture Venue — CSM 353',
        body: `Attention CS 300 students,

Please note that the lecture venue for CSM 353 (Survey of Programming Languages) has changed effective immediately.

Previous venue: Room 101, Engineering Block
New venue: Lecture Theatre 2, Main Academic Block

Affected sessions:
- Tuesday 2:00pm – 4:00pm ✅ New venue
- Thursday 4:00pm – 6:00pm ✅ New venue

Friday practicals remain in Lab 3, Computer Science Building — no change.

If you have any questions please contact me or send a message in the Telegram group.

— Schnelle (CS 300 Course Rep)`,
        category: 'general', course: 'CSM 353 — Survey of Programming Languages',
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 91,
        created_at: ago(5), updated_at: ago(5),
      },

      {
        id: uuidv4(), author_id: USER_IDS.jennifer,
        title: 'Departmental Seminar — AI in Education',
        body: `The Department of Computer Science invites all Level 300 students to the upcoming departmental seminar:

Topic: Artificial Intelligence in Modern Education — Opportunities and Ethical Challenges
Speaker: Dr. Emmanuel Kwarteng (University of Ghana, Legon)
Date: Friday, 3rd April 2026
Time: 10:00am – 12:00pm
Venue: Lecture Hall 3, Main Academic Block

Attendance is strongly encouraged. A brief reflection report on the seminar may be required as part of the Software Engineering course assessment.

Light refreshments will be served. Please arrive on time.`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 53,
        created_at: ago(3), updated_at: ago(3),
      },

      {
        id: uuidv4(), author_id: USER_IDS.eliah,
        title: 'CS 300 Course Telegram Group Links',
        body: `All CS 300 students,

Here are the official Telegram group links for all courses this semester. Join all groups — lecture notes, announcements, and materials are shared there.

These links are for CS 300 students ONLY. Do not share externally.

If a link isn't working or you've been removed, message me directly.

— Eliah (CS 300 Course Rep)`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null,
        useful_links: JSON.stringify([
          { label: 'DSA Group', url: 'https://t.me/cs300dsa' },
          { label: 'CSM 353 Group', url: 'https://t.me/cs300csm353' },
          { label: 'OOP Group', url: 'https://t.me/cs300oop' },
          { label: 'Software Engineering Group', url: 'https://t.me/cs300se' },
          { label: 'OS Group', url: 'https://t.me/cs300os' },
        ]),
        view_count: 108,
        created_at: ago(8), updated_at: ago(8),
      },

      {
        id: uuidv4(), author_id: USER_IDS.schnelle,
        title: 'GETFUND Scholarship 2026 — Application Open',
        body: `Attention CS 300 Students,

The Ghana Education Trust Fund (GETFUND) 2026 Undergraduate Scholarship is now open for applications.

Eligibility:
- Ghanaian citizen enrolled in an accredited university
- Minimum CGPA of 3.0 / Second Class Upper or equivalent
- Demonstrated financial need

Required Documents:
1. Completed GETFUND application form (Students Affairs office, Ground Floor, Admin Block)
2. Official transcript
3. Enrolment confirmation letter
4. Two reference letters (at least one from a lecturer)
5. Proof of citizenship (passport or national ID)

Submission Deadline: 15th April 2026
Late submissions will NOT be accepted.`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: fixed('2026-04-15T23:59:00Z'),
        useful_links: JSON.stringify([
          { label: 'GETFUND Official Website', url: 'https://getfund.gov.gh' },
        ]),
        view_count: 97,
        created_at: ago(4), updated_at: ago(4),
      },

      {
        id: uuidv4(), author_id: USER_IDS.jennifer,
        title: 'Extended Library Hours & E-Resources',
        body: `CS 300 students,

The university library has extended opening hours for the examination period:

Monday – Friday:  7:00am – 11:00pm
Saturday:         8:00am – 8:00pm
Sunday:           12:00pm – 8:00pm

Online databases accessible via the library portal:
- IEEE Xplore — engineering, computer science, IT
- ACM Digital Library — algorithms, software engineering
- SpringerLink — textbooks and journals
- LinkedIn Learning — free video courses with student ID

Off-campus access: Use your student ID as username and date of birth (DDMMYYYY) as password on the library portal.`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null,
        useful_links: JSON.stringify([
          { label: 'Library Portal', url: 'https://library.university.edu.gh' },
          { label: 'IEEE Xplore', url: 'https://ieeexplore.ieee.org' },
          { label: 'ACM Digital Library', url: 'https://dl.acm.org' },
        ]),
        view_count: 62,
        created_at: ago(6), updated_at: ago(6),
      },

      {
        id: uuidv4(), author_id: USER_IDS.eliah,
        title: 'Semester 2 Lecture Schedule Update',
        body: `CS 300 students,

The updated lecture timetable for Semester 2 is now available. Key changes from Semester 1:

- CSM 353 has moved to Lecture Theatre 2 (see earlier notice)
- Algorithm Design lectures are now on Mondays and Wednesdays (was Tuesdays and Thursdays)
- Operating Systems has an additional tutorial session on Fridays, 8am–9am, Room 204

The full updated timetable has been pinned on the department notice board outside the HOD's office.

For conflicts or timetable clashes, see the Academic Affairs office within the first two weeks of semester.`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 76,
        created_at: ago(9), updated_at: ago(9),
      },

      {
        id: uuidv4(), author_id: USER_IDS.schnelle,
        title: 'Graduate School Open Day — Attend If Interested',
        body: `CS 300 students,

For those thinking about postgraduate studies, the university is hosting a Graduate School Open Day:

Date: Saturday, 5th April 2026
Time: 9:00am – 2:00pm
Venue: Senate Building, Ground Floor Hall

What to expect:
- Information on MSc and PhD programmes in CS, IT, and Engineering
- Scholarship and funding opportunities (both local and international)
- Panel discussion with current postgraduate students
- One-on-one consultations with programme coordinators

Attendance is optional but recommended if you're planning ahead. No registration needed — just show up.`,
        category: 'general', course: null,
        program: 'Bsc. Computer Science', level: '300', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 44,
        created_at: ago(2), updated_at: ago(2),
      },

      // ═══════════════════════════════════════════════════════════════════════
      // IT 200  ·  ASSIGNMENTS  (10)
      // ═══════════════════════════════════════════════════════════════════════

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'Financial Accounting — Returns Day Books',
        body: `July 20X9 Transactions — Returns Day Books

The following credit transactions occurred during July 20X9:
- K Hill returned goods worth £340
- M Norman returned goods worth £210
- E Rigby returned goods worth £580
- E Phillips returned goods worth £125

Tasks:
1. Record all transactions in the appropriate Returns Day Books (Returns Inwards and Returns Outwards).
2. Post each entry to the relevant Personal Accounts in the Sales/Purchase Ledger.
3. Transfer month-end totals to the General Ledger.

Show all workings. Use the standard double-entry format. Submission: Typed PDF.`,
        category: 'assignment', course: 'Financial Accounting',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: true, pinned_at: ago(0),
        deadline: from(5), useful_links: JSON.stringify([]), view_count: 35,
        created_at: ago(0), updated_at: ago(0),
      },

      {
        id: uuidv4(), author_id: USER_IDS.osei,
        title: 'Financial Accounting — Trial Balance and Financial Statements',
        body: `T. Owen Trial Balance at 31 March 20X9

Using the trial balance provided in class (Week 8 handout), prepare:

1. Trading Account for the year ended 31 March 20X9
2. Profit and Loss Account for the same period
3. Balance Sheet as at 31 March 20X9

Additional adjustments:
- Closing stock: £58,440
- Depreciation on equipment: 10% straight-line method
- Accrued salaries: £2,000
- Prepaid insurance: £500

Show all workings. Present all statements in the vertical format.`,
        category: 'assignment', course: 'Financial Accounting',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(7), useful_links: JSON.stringify([]), view_count: 29,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'Database Systems — Normalization Assignment',
        body: `Assignment: Database Normalization

Unnormalized relation:
ORDER(OrderID, CustomerName, CustomerPhone, ProductID, ProductName, Quantity, UnitPrice)

Tasks:
1. Identify all functional dependencies in the relation.
2. Convert to 1NF — explain changes made.
3. Convert to 2NF — explain changes made.
4. Convert to 3NF — explain changes made.
5. Draw an Entity-Relationship Diagram (ERD) for the final 3NF schema.

Submission: Typed PDF. Hand-drawn ERDs must be photographed clearly and embedded.`,
        category: 'assignment', course: 'Database Systems',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(6), useful_links: JSON.stringify([]), view_count: 27,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'Web Development Practical — HTML, CSS & JavaScript',
        body: `Build a personal portfolio webpage using HTML, CSS, and JavaScript.

Structure (HTML):
- Navigation bar with at least 3 internal links
- Hero section with your name and a short bio
- Skills section (minimum 5 skills)
- Contact form (name, email, message fields)

Styling (CSS):
- Responsive layout using Flexbox or CSS Grid
- Minimum 3 colours in a consistent colour scheme
- Hover effects on buttons and navigation links

Interactivity (JavaScript):
- Form validation — all fields required, email must be valid format
- Show a confirmation message on successful submission (no backend required)

Submission: .zip file of your project folder via the student portal.`,
        category: 'assignment', course: 'Web Development',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(9), useful_links: JSON.stringify([]), view_count: 41,
        created_at: ago(0), updated_at: ago(0),
      },

      {
        id: uuidv4(), author_id: USER_IDS.osei,
        title: 'Information Systems — Requirements Analysis Report',
        body: `Assignment: Requirements Analysis for an Information System

Choose ONE of the following case scenarios:
(a) A Hospital Patient Management System
(b) A University Course Registration System
(c) A Small Business Inventory Management System

Produce a Requirements Analysis Report that includes:
1. System Overview — problem statement and objectives
2. Stakeholder Analysis — list and describe each stakeholder's role
3. Functional Requirements — at least 10, presented as numbered statements
4. Non-functional Requirements — at least 5 (performance, security, usability, etc.)
5. Data Flow Diagram (DFD) — Level 0 (context) and Level 1
6. Feasibility Study — technical, economic, and operational feasibility

Format: Professional report, minimum 1500 words. Include diagrams.`,
        category: 'assignment', course: 'Information Systems Analysis and Design',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(8), useful_links: JSON.stringify([]), view_count: 23,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'Networking Fundamentals — Subnetting Lab',
        body: `Networking Lab Assignment: IP Addressing and Subnetting

Task 1 — Subnetting:
Given network: 172.16.0.0/16
Divide it into 8 equal subnets. For each subnet, provide:
- Network address
- Subnet mask (dotted decimal)
- Broadcast address
- First and last usable host address
- Number of usable hosts

Task 2 — CIDR Notation:
Convert the following to CIDR: 255.255.224.0 / 255.255.255.192

Task 3 — Packet Tracing (Packet Tracer):
Build a small network with 2 routers, 2 switches, and 4 PCs. Configure IP addresses and test connectivity with ping. Submit your .pkt file and a screenshot of successful pings.

Submission: PDF report + Packet Tracer file (.pkt).`,
        category: 'assignment', course: 'Networking Fundamentals',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(10), useful_links: JSON.stringify([]), view_count: 31,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'IT Project Management — Project Plan Assignment',
        body: `Assignment: IT Project Management Plan

Scenario: You have been appointed as project manager for the development of a mobile banking app for a small credit union.

Deliverables:
1. Project Charter — objectives, scope, stakeholders, constraints, assumptions.
2. Work Breakdown Structure (WBS) — at least 3 levels deep.
3. Gantt Chart — covering a 12-week project timeline with milestones.
4. Risk Register — identify at least 6 risks, their likelihood, impact, and mitigation strategies.
5. Communication Plan — how information will flow between team members and stakeholders.

Tools: MS Project, Excel, or Trello for Gantt. PDF for written sections.

Individual submission.`,
        category: 'assignment', course: 'IT Project Management',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(12), useful_links: JSON.stringify([]), view_count: 18,
        created_at: ago(0), updated_at: ago(0),
      },

      {
        id: uuidv4(), author_id: USER_IDS.osei,
        title: 'Systems Analysis — DFD and ERD Assignment',
        body: `Systems Analysis and Design — Assignment 2

For a Library Book Borrowing System:

1. Data Flow Diagrams:
   (a) Level 0 (Context Diagram) — show the system boundary and all external entities.
   (b) Level 1 DFD — decompose all major processes. Show all data flows and data stores.

2. Entity-Relationship Diagram (ERD):
   - Identify all entities (minimum: Member, Book, Loan, Author).
   - Show all relationships with cardinality notation (1:1, 1:N, M:N).
   - Include all primary and foreign keys.

3. Data Dictionary — define at least 5 data elements from your DFD.

Tools: draw.io, Lucidchart, or hand-drawn (photographed clearly). Submit as PDF.`,
        category: 'assignment', course: 'Information Systems Analysis and Design',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(11), useful_links: JSON.stringify([
          { label: 'draw.io', url: 'https://draw.io' },
        ]), view_count: 22,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'Data Communications — Signal Types and Transmission Media',
        body: `Assignment: Data Communications Fundamentals

1. Signal Types:
   (a) Explain the difference between analogue and digital signals. Draw a labelled diagram for each.
   (b) What is bandwidth? How does it affect data transmission speed?
   (c) Describe attenuation and noise. How do they affect signal quality over long distances?

2. Transmission Media — compare the following in a table:
   Twisted Pair | Coaxial Cable | Fibre Optic | Wireless
   Columns: Cost, Speed, Distance, Interference susceptibility, Use case

3. Nyquist Theorem:
   A channel has a bandwidth of 4000 Hz. What is the maximum data rate if the signal has 8 voltage levels?

4. Shannon's Theorem:
   A noisy channel has a bandwidth of 3100 Hz with SNR of 30 dB. What is the maximum channel capacity?

Submission: Typed PDF. Show all calculations.`,
        category: 'assignment', course: 'Data Communications',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(4), useful_links: JSON.stringify([]), view_count: 25,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'E-Commerce — Business Model Analysis',
        body: `Assignment: E-Commerce Business Model Analysis

Select ONE established e-commerce company (e.g. Jumia, Amazon, Alibaba, Uber Eats, or a Ghanaian example such as Tonaton or Meqasa).

Write a structured analysis covering:
1. Business Model Type — B2C, B2B, C2C, or hybrid? Justify your classification.
2. Revenue Model — how does the company generate income? (advertising, subscription, commission, etc.)
3. Value Proposition — what unique value does it offer to customers?
4. Technology Infrastructure — what platforms, payment systems, and logistics does it use?
5. Competitive Advantage — what differentiates it from competitors?
6. Challenges — identify at least 3 challenges the company faces in the African or global market.

Word count: 1000–1500 words. Include references (APA format).`,
        category: 'assignment', course: 'E-Commerce and Digital Business',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(13), useful_links: JSON.stringify([]), view_count: 20,
        created_at: ago(0), updated_at: ago(0),
      },

      // ═══════════════════════════════════════════════════════════════════════
      // IT 200  ·  EXAMS  (7)
      // ═══════════════════════════════════════════════════════════════════════

      {
        id: uuidv4(), author_id: USER_IDS.efua,
        title: 'Financial Accounting — End-of-Semester Examination Notice',
        body: `End-of-Semester Examination — Financial Accounting

All IT 200 students: the final examination for Financial Accounting is approaching.

Scope: Chapters 1–10 of the prescribed textbook + all tutorial exercises.

Key topics:
- Double-entry bookkeeping principles
- Day Books (Sales, Purchases, Returns Inwards/Outwards)
- Trial Balance preparation and errors
- Trading and Profit & Loss Accounts
- Balance Sheet (horizontal and vertical formats)
- Depreciation methods (straight-line, reducing balance)
- Accruals and prepayments

Format: Section A — 30 MCQ (30 marks) | Section B — Long questions (70 marks)
Duration: 3 Hours | Scientific calculators allowed. Programmable calculators NOT allowed.`,
        category: 'exams', course: 'Financial Accounting',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: true, pinned_at: ago(1),
        deadline: from(20), useful_links: JSON.stringify([]), view_count: 82,
        created_at: ago(1), updated_at: ago(1),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'Database Systems — Mid-Semester Examination',
        body: `Mid-Semester Examination Notice — Introduction to Database Systems

All IT 200 students are reminded of the upcoming mid-semester examination.

Coverage:
- Relational model: tables, keys (primary, foreign, candidate, composite)
- SQL: SELECT, INSERT, UPDATE, DELETE; WHERE, GROUP BY, HAVING, ORDER BY
- Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF
- Normalization: 1NF, 2NF, 3NF (theory + practice)
- Entity-Relationship modelling
- ACID properties and transactions

Duration: 1 Hour 30 Minutes | Closed book
Review all practical SQL exercises from the lab sessions. Past mid-semester questions available from the department library.`,
        category: 'exams', course: 'Database Systems',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(17), useful_links: JSON.stringify([]), view_count: 64,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.osei,
        title: 'Web Development — Final Examination Notice',
        body: `Final Examination — Web Development

This notice covers the final examination for IT 200 Web Development students.

Scope: All lectures (HTML5, CSS3, JavaScript) + lab practicals

Theoretical coverage:
- HTML semantic elements, forms, tables, media
- CSS selectors, box model, Flexbox, Grid, responsive design
- JavaScript: DOM manipulation, events, form validation, async (fetch/promises)
- HTTP fundamentals: requests, responses, status codes
- Web accessibility standards (WCAG 2.1 basics)

The exam includes a practical section (30 minutes) where you will write code in a controlled lab environment.

Duration: 2 Hours 30 Minutes (theory) + 30 Minutes (practical)`,
        category: 'exams', course: 'Web Development',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(23), useful_links: JSON.stringify([]), view_count: 57,
        created_at: ago(3), updated_at: ago(3),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'IT Fundamentals — End-of-Semester Examination',
        body: `End-of-Semester Examination Notice — IT Fundamentals

Coverage: All 13 weeks of content

Topics:
- Number systems and conversions (binary, octal, hexadecimal, decimal)
- Logic gates and Boolean algebra
- Computer architecture: CPU, memory hierarchy, I/O
- Operating systems overview: types, functions, process management
- Networking basics: types of networks, topologies, protocols
- Information security: threats, encryption basics, firewall, antivirus
- Software development lifecycle overview

Format: Section A (MCQ, 40 marks) + Section B (Short answers, 60 marks)
Duration: 3 Hours | No programmable devices permitted.`,
        category: 'exams', course: 'IT Fundamentals',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(21), useful_links: JSON.stringify([]), view_count: 73,
        created_at: ago(3), updated_at: ago(3),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'Networking Fundamentals — Semester Examination',
        body: `Examination Notice — Networking Fundamentals

IT 200 students should note the upcoming Networking Fundamentals examination.

Coverage:
- Network types and topologies (LAN, WAN, MAN, PAN)
- OSI and TCP/IP models — layers, protocols, and their functions
- IP addressing (IPv4 and IPv6), subnetting, CIDR
- Network devices: hub, switch, router, bridge, gateway, NIC
- Wireless networking: Wi-Fi standards (802.11a/b/g/n/ac), security (WPA2, WPA3)
- Basic routing and switching concepts
- Network troubleshooting commands: ping, traceroute, ipconfig/ifconfig, nslookup

Duration: 2 Hours | Bring student ID. Closed book.`,
        category: 'exams', course: 'Networking Fundamentals',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(15), useful_links: JSON.stringify([]), view_count: 58,
        created_at: ago(4), updated_at: ago(4),
      },

      {
        id: uuidv4(), author_id: USER_IDS.osei,
        title: 'Information Systems — Mid-Semester Assessment',
        body: `Mid-Semester Assessment — Information Systems Analysis and Design

Format: Written test (no practical component)

Coverage:
- Definition and types of information systems (TPS, MIS, DSS, EIS)
- Systems development methodologies (Waterfall, Agile, Prototyping)
- Requirements gathering techniques (interviews, observation, questionnaires, document analysis)
- Data Flow Diagrams (DFD) — Level 0 and Level 1
- Feasibility study components (technical, economic, legal, operational)
- Systems analysis vs. systems design

Duration: 1 Hour 15 Minutes | Short-answer format. No MCQ.
Bring your student ID and pens. No reference materials allowed.`,
        category: 'exams', course: 'Information Systems Analysis and Design',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(19), useful_links: JSON.stringify([]), view_count: 46,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.boateng,
        title: 'Data Communications — End-of-Semester Examination',
        body: `Examination Notice — Data Communications

All IT 200 students: please note the upcoming end-of-semester examination for Data Communications.

Topics:
- Analogue vs digital signals; bandwidth, attenuation, noise
- Nyquist and Shannon theorems (calculations required)
- Transmission media: twisted pair, coaxial, fibre optic, wireless
- Data encoding: NRZ, Manchester, AMI, QAM
- Error detection and correction: parity bits, CRC, Hamming code
- Multiplexing: FDM, TDM, WDM
- Circuit switching vs packet switching
- Modulation: AM, FM, PM, ASK, FSK, PSK

Format: Theory + calculation questions. Scientific calculators permitted.
Duration: 2 Hours 30 Minutes.`,
        category: 'exams', course: 'Data Communications',
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: from(25), useful_links: JSON.stringify([]), view_count: 52,
        created_at: ago(4), updated_at: ago(4),
      },

      // ═══════════════════════════════════════════════════════════════════════
      // IT 200  ·  GENERAL  (8)
      // ═══════════════════════════════════════════════════════════════════════

      {
        id: uuidv4(), author_id: USER_IDS.nana,
        title: 'Welcome to Semester 2 — IT 200',
        body: `Hi everyone 👋

Welcome back to Semester 2! A few important things to note:

1. All assignment deadlines and exam notices for IT 200 are posted here on NoticeHub. Check it regularly so you don't miss anything.
2. Lecture timetables are on the department notice board. Any venue or time changes will be posted here immediately.
3. Course Telegram group links are in a separate post below — join all of them.
4. If you have any issues with your registration, portal errors, or level corrections, come to any of us (Kwabena, Efua, or myself).

Let's make it a great semester.

— Nana (IT 200 Course Rep)`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 121,
        created_at: ago(10), updated_at: ago(10),
      },

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'IT 200 Course Telegram Group Links',
        body: `All IT 200 students,

Join all official course Telegram groups below — notes, past questions, and important announcements are shared there.

These links are for IT 200 students ONLY. Please do not share externally.

If a link is broken or you've been removed, DM me directly.

— Kwabena (IT 200 Course Rep)`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null,
        useful_links: JSON.stringify([
          { label: 'Financial Accounting Group', url: 'https://t.me/it200accounting' },
          { label: 'Database Systems Group', url: 'https://t.me/it200databases' },
          { label: 'Web Development Group', url: 'https://t.me/it200webdev' },
          { label: 'Networking Group', url: 'https://t.me/it200networking' },
          { label: 'IT Fundamentals Group', url: 'https://t.me/it200fundamentals' },
        ]),
        view_count: 115,
        created_at: ago(9), updated_at: ago(9),
      },

      {
        id: uuidv4(), author_id: USER_IDS.efua,
        title: 'Library Access & E-Resources for IT 200',
        body: `IT 200 students,

The university library has extended access hours this semester:

Monday – Friday:  7:00am – 10:00pm
Saturday:         8:00am – 6:00pm
Sunday:           12:00pm – 6:00pm

Online databases available through the library portal:
- IEEE Xplore — engineering and IT journals
- ACM Digital Library — computer science research
- JSTOR — business, accounting, and interdisciplinary
- LinkedIn Learning — free with your student ID

Off-campus access: Use your student ID as username and date of birth (DDMMYYYY) as password. Contact the library helpdesk if you need help.

— Efua (IT 200 Course Rep)`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null,
        useful_links: JSON.stringify([
          { label: 'Library Portal', url: 'https://library.university.edu.gh' },
          { label: 'IEEE Xplore', url: 'https://ieeexplore.ieee.org' },
        ]),
        view_count: 69,
        created_at: ago(6), updated_at: ago(6),
      },

      {
        id: uuidv4(), author_id: USER_IDS.nana,
        title: 'GETFUND Scholarship 2026 — Application Open',
        body: `Attention IT 200 Students,

The Ghana Education Trust Fund (GETFUND) 2026 Undergraduate Scholarship is now open.

Eligibility:
- Ghanaian citizen enrolled in an accredited university
- Minimum CGPA of 3.0 / Second Class Upper or equivalent
- Financial need supported by documentation

Required Documents:
1. Completed GETFUND application form — available at Students Affairs, Ground Floor, Admin Block
2. Official transcript or academic results
3. Enrolment / admission confirmation letter
4. Two reference letters (at least one from a lecturer)
5. Proof of Ghanaian citizenship

Submission Deadline: 15th April 2026
Late submissions will NOT be accepted under any circumstances.`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: fixed('2026-04-15T23:59:00Z'),
        useful_links: JSON.stringify([
          { label: 'GETFUND Official Website', url: 'https://getfund.gov.gh' },
        ]),
        view_count: 103,
        created_at: ago(4), updated_at: ago(4),
      },

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'School Fees — Second Semester Payment Reminder',
        body: `IT 200 students,

This is a reminder that the deadline for second semester school fees payment is approaching.

Payment Deadline: 10th April 2026

How to pay:
1. Log into the student portal and generate your fee invoice.
2. Pay via mobile money (MTN, Vodafone, AirtelTigo) or bank transfer to the university's designated accounts.
3. Upload your payment receipt on the portal — do NOT submit physical receipts.

Students with outstanding balances from Semester 1 must clear them first.

If you are on a scholarship or financial aid, ensure your award letter has been submitted to the Finance Office before the deadline to avoid de-registration.`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: fixed('2026-04-10T23:59:00Z'),
        useful_links: JSON.stringify([
          { label: 'Student Portal', url: 'https://portal.university.edu.gh' },
        ]),
        view_count: 138,
        created_at: ago(3), updated_at: ago(3),
      },

      {
        id: uuidv4(), author_id: USER_IDS.efua,
        title: 'Study Group Formation — IT 200',
        body: `IT 200 students,

With exams approaching, I'm coordinating study groups for each course. If you're interested in joining a study group, reply to this notice or message me on Telegram.

Current groups forming:
- Financial Accounting — Tuesdays, 4pm–6pm, Library Study Room 3
- Database Systems — Thursdays, 3pm–5pm, Lab 2 Corridor
- Web Development — Saturdays, 10am–12pm, Room 104

Spaces are limited to 8 students per group to keep sessions productive. Priority is given to those who confirm early.

If you want to form a group for a course not listed, let me know and I'll help coordinate.

— Efua (IT 200 Course Rep)`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 84,
        created_at: ago(2), updated_at: ago(2),
      },

      {
        id: uuidv4(), author_id: USER_IDS.nana,
        title: 'Departmental ICT Fair — IT 200 Participation',
        body: `IT 200 students,

The Department of Information Technology is organising its annual ICT Fair and IT 200 students are encouraged to participate.

Event details:
Date: Friday 4th April – Saturday 5th April 2026
Venue: ICT Centre Foyer and Courtyard

Participation options:
(a) Project Exhibition — present a working tech project (app, website, IoT prototype, etc.)
(b) Poster Presentation — present a research topic relevant to IT
(c) Live Demo — demonstrate a software tool, API, or technology you've built

Registration: Submit a one-paragraph project/topic description to the department secretary by 31st March 2026.

First, second, and third place winners receive certificates and cash prizes (GHS 500, 300, 200). Participation certificates are awarded to all exhibitors.`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null, useful_links: JSON.stringify([]), view_count: 77,
        created_at: ago(5), updated_at: ago(5),
      },

      {
        id: uuidv4(), author_id: USER_IDS.kwabena,
        title: 'Free Software Access for IT Students',
        body: `IT 200 students,

A reminder that as university IT students, you have free access to several software licences through the institution's agreements:

Available FREE with your student email (@university.edu.gh):
- Microsoft 365 (Word, Excel, PowerPoint, Teams, OneDrive 1TB)
- GitHub Student Developer Pack (GitHub Pro + 100+ tools)
- JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.)
- Autodesk software (AutoCAD, Fusion 360)
- Adobe Creative Cloud — limited access

To activate:
1. Use your official university email address
2. Visit the respective platform's student/education page
3. Verify your student status

For GitHub Education Pack, you may need to upload a copy of your student ID or enrolment letter. The process takes 1–3 days to verify.`,
        category: 'general', course: null,
        program: 'Bsc. Information Technology', level: '200', status: 'published',
        is_pinned: false, pinned_at: null,
        deadline: null,
        useful_links: JSON.stringify([
          { label: 'GitHub Student Pack', url: 'https://education.github.com/pack' },
          { label: 'JetBrains Student', url: 'https://www.jetbrains.com/student/' },
          { label: 'Microsoft 365 Education', url: 'https://www.microsoft.com/en-us/education' },
        ]),
        view_count: 156,
        created_at: ago(7), updated_at: ago(7),
      },

    ];

    await queryInterface.bulkInsert('announcements', A);
    console.log(`\nAnnouncements seeder complete: ${A.length} notices inserted.`);
    console.log(`  CS 300 (Schnelle/Jennifer/Eliah): ${A.filter(x => x.level === '300').length}`);
    console.log(`  IT 200 (Kwabena/Efua/Nana)      : ${A.filter(x => x.level === '200').length}\n`);
  },

  async down(queryInterface) {
    const authorIds = Object.values(USER_IDS);
    await queryInterface.bulkDelete('announcements', { author_id: authorIds }, {});
  },
};
