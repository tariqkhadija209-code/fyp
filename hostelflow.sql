-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: May 03, 2026 at 02:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hostelflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `allocations`
--

CREATE TABLE `allocations` (
  `allocation_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `allocation_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `allocations`
--

INSERT INTO `allocations` (`allocation_id`, `student_id`, `room_id`, `allocation_date`, `expiry_date`) VALUES
(2, 2, 3, '2026-04-25', '2026-05-31'),
(5, 1, 2, '2026-04-27', NULL),
(6, 3, 2, '2026-04-27', NULL),
(7, 4, 3, '2026-04-27', NULL),
(8, 5, 1, '2026-04-27', NULL),
(9, 1, 2, '2026-04-27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `app_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `seniority_score` float DEFAULT 0,
  `distance_from_home` float DEFAULT NULL,
  `academic_record` float DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `room_type_preference` enum('Single','Double','Triple') DEFAULT 'Double',
  `medical_condition` text DEFAULT NULL,
  `cgpa` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `status` enum('Present','Absent') DEFAULT 'Present',
  `marked_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `student_id`, `status`, `marked_date`) VALUES
(1, 2, 'Present', '2026-04-22'),
(2, 2, 'Present', '2026-04-23'),
(3, 2, 'Present', '2026-04-25'),
(4, 3, 'Present', '2026-04-27'),
(8, 5, 'Present', '2026-04-27'),
(9, 5, 'Present', '2026-04-27'),
(10, 2, 'Present', '2026-04-27'),
(11, 5, 'Present', '2026-05-02'),
(12, 2, 'Present', '2026-05-02');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `complaint_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `complaint_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `status` enum('Open','In Progress','Resolved') DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ai_suggested_priority` enum('Low','Medium','High') DEFAULT NULL,
  `complaint_sentiment` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`complaint_id`, `student_id`, `complaint_type`, `description`, `priority`, `status`, `created_at`, `ai_suggested_priority`, `complaint_sentiment`) VALUES
(21, 5, 'fire ', 'fire explosion', 'High', '', '2026-04-27 20:33:52', NULL, NULL),
(22, 5, 'electricity', 'Load Shedding', 'High', '', '2026-04-27 20:48:50', NULL, NULL),
(23, 2, 'Cocroach in my room', 'cocroach in my room in window', 'Low', '', '2026-05-02 15:32:29', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fees`
--

CREATE TABLE `fees` (
  `fee_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `fee_type` enum('Hostel','Mess','Security') DEFAULT NULL,
  `billing_month` varchar(20) DEFAULT NULL,
  `status` enum('Paid','Unpaid') DEFAULT 'Unpaid',
  `payment_date` date DEFAULT NULL,
  `stripe_payment_id` varchar(255) DEFAULT NULL,
  `receipt_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fees`
--

INSERT INTO `fees` (`fee_id`, `student_id`, `amount`, `fee_type`, `billing_month`, `status`, `payment_date`, `stripe_payment_id`, `receipt_url`) VALUES
(1, 1, 10000.00, '', 'may 2026', 'Paid', '2026-04-23', NULL, NULL),
(2, 2, 10000.00, '', 'may 2026', 'Paid', '2026-04-22', NULL, NULL),
(3, 1, 10000.00, '', 'april 2026', 'Paid', '2026-04-23', NULL, NULL),
(4, 2, 10000.00, '', 'april 2026', 'Paid', '2026-04-22', 'E1234578621', NULL),
(5, 1, 10000.00, '', 'june 2025', 'Paid', '2026-04-23', NULL, NULL),
(6, 2, 10000.00, '', 'june 2025', 'Paid', '2026-04-23', NULL, NULL),
(9, 1, 10000.00, NULL, 'july 2026', 'Paid', '2026-04-23', NULL, NULL),
(10, 1, 10000.00, NULL, 'march 2026', 'Paid', '2026-04-23', NULL, NULL),
(11, 2, 10000.00, NULL, 'march 2026', 'Paid', '2026-04-23', NULL, NULL),
(12, 1, 10000.00, NULL, 'feb 2026', 'Paid', '2026-05-02', NULL, NULL),
(13, 2, 10000.00, NULL, 'feb 2026', 'Unpaid', NULL, NULL, NULL),
(14, 3, 10000.00, NULL, 'feb 2026', 'Paid', '2026-04-27', NULL, NULL),
(15, 2, 8000.00, '', 'jan 2026', 'Paid', '2026-05-02', NULL, NULL),
(16, 2, 10000.00, NULL, 'feb 2026', 'Paid', '2026-04-27', NULL, NULL),
(17, 1, 10000.00, NULL, 'feb 2026', 'Paid', '2026-05-02', NULL, NULL),
(18, 3, 10000.00, NULL, 'feb 2026', 'Unpaid', NULL, NULL, NULL),
(19, 4, 10000.00, NULL, 'feb 2026', 'Paid', '2026-05-02', NULL, NULL),
(20, 5, 10000.00, NULL, 'feb 2026', 'Paid', '2026-04-27', NULL, NULL),
(21, 2, 10000.00, NULL, 'jan 2026', 'Unpaid', NULL, NULL, NULL),
(22, 1, 10000.00, NULL, 'jan 2026', 'Paid', '2026-05-02', NULL, NULL),
(23, 3, 10000.00, NULL, 'jan 2026', 'Unpaid', NULL, NULL, NULL),
(24, 4, 10000.00, NULL, 'jan 2026', 'Unpaid', NULL, NULL, NULL),
(25, 5, 10000.00, NULL, 'jan 2026', 'Paid', '2026-05-02', NULL, NULL),
(26, 1, 10000.00, NULL, 'jan 2026', 'Unpaid', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `hostel_rooms`
--

CREATE TABLE `hostel_rooms` (
  `room_id` int(11) NOT NULL,
  `room_no` varchar(10) NOT NULL,
  `block` varchar(10) DEFAULT NULL,
  `capacity` int(11) DEFAULT 4,
  `current_occupancy` int(11) DEFAULT 0,
  `status` enum('Available','Full') DEFAULT 'Available',
  `wing` varchar(50) DEFAULT 'General'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hostel_rooms`
--

INSERT INTO `hostel_rooms` (`room_id`, `room_no`, `block`, `capacity`, `current_occupancy`, `status`, `wing`) VALUES
(1, 'S01', 'A', 2, 1, 'Full', 'General'),
(2, 'S02', 'B', 3, 3, 'Available', 'General'),
(3, 'S03', 'C', 1, 1, 'Available', 'General'),
(4, 'S04', 'C', 4, 0, 'Available', 'Computing'),
(6, ' T01', 'D', 3, 0, 'Available', 'IT-Wing');

-- --------------------------------------------------------

--
-- Table structure for table `mess_menu`
--

CREATE TABLE `mess_menu` (
  `menu_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `meal_type` enum('Breakfast','Lunch','Dinner') DEFAULT NULL,
  `dish_name` varchar(100) DEFAULT NULL,
  `calories` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_menu`
--

INSERT INTO `mess_menu` (`menu_id`, `day_of_week`, `meal_type`, `dish_name`, `calories`) VALUES
(1, 'Wednesday', 'Lunch', 'biryani', NULL),
(2, 'Monday', 'Dinner', 'fish', NULL),
(3, 'Tuesday', 'Breakfast', 'alu pratha', NULL),
(4, 'Friday', 'Lunch', 'pulao', NULL),
(5, 'Thursday', 'Dinner', 'Bindhi', NULL),
(6, 'Saturday', 'Dinner', 'Roasted Chicken', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notif_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notif_id`, `sender_id`, `title`, `message`, `created_at`) VALUES
(1, 2, 'Hostel Closing time', 'Closing time will be 7:00 ', '2026-04-22 18:45:01'),
(2, NULL, 'Tour update', 'Tour is postponed due to roads blockage. We will update u soon.', '2026-04-25 16:08:17'),
(3, NULL, 'Holiday Notification', 'Hostel is closed on 1st may.', '2026-04-27 16:47:29'),
(4, NULL, 'Mess timing', 'Timing is from 1 pm to 3 pm.', '2026-04-28 00:25:06');

-- --------------------------------------------------------

--
-- Table structure for table `staff_profiles`
--

CREATE TABLE `staff_profiles` (
  `staff_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `employee_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `roll_no` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `contact_no` varchar(15) DEFAULT NULL,
  `cnic` varchar(15) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `user_id`, `roll_no`, `full_name`, `department`, `contact_no`, `cnic`, `gender`) VALUES
(1, 1, 'BIT22011', 'alina zahid', 'IT', NULL, NULL, NULL),
(2, 4, 'BIT22021', 'Noor ul ain Shakir', 'IT', NULL, NULL, NULL),
(3, 5, 'BIT22012', 'Aliza Muskan', 'IT', NULL, NULL, NULL),
(4, 6, 'BIT22046', 'Shiza Amanat', 'Computing', NULL, NULL, NULL),
(5, 7, 'BIT22001', 'Khadija Tariq', 'General', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Warden','Student') DEFAULT 'Student',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role`, `is_active`, `created_at`) VALUES
(1, 'alina', 'alinahostel@gmail.com', '123', 'Student', 1, '2026-04-22 06:35:32'),
(2, 'admin', 'adminhostel@gmail.com', 'admin123', 'Admin', 1, '2026-04-22 08:49:14'),
(3, 'warden', 'wardenhostel@gmail.com', 'warden123', 'Warden', 1, '2026-04-22 08:50:06'),
(4, 'Noor Ul Ain', 'noorhostel@gmail.com', 'noor123', 'Student', 1, '2026-04-22 09:02:55'),
(5, 'Aliza', 'alizahostel@gmail.com', 'aliza123', 'Student', 1, '2026-04-27 15:26:27'),
(6, 'Shiza', 'shizahostel@gmail.com', 'shiza123', 'Student', 1, '2026-04-27 17:15:39'),
(7, 'khadija', 'Khadijahostel@gmail.com', 'khadija123', 'Student', 1, '2026-04-27 19:26:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allocations`
--
ALTER TABLE `allocations`
  ADD PRIMARY KEY (`allocation_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`app_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `fees`
--
ALTER TABLE `fees`
  ADD PRIMARY KEY (`fee_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD UNIQUE KEY `room_no` (`room_no`);

--
-- Indexes for table `mess_menu`
--
ALTER TABLE `mess_menu`
  ADD PRIMARY KEY (`menu_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notif_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `roll_no` (`roll_no`),
  ADD UNIQUE KEY `cnic` (`cnic`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `allocations`
--
ALTER TABLE `allocations`
  MODIFY `allocation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `app_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `complaint_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `fees`
--
ALTER TABLE `fees`
  MODIFY `fee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `mess_menu`
--
ALTER TABLE `mess_menu`
  MODIFY `menu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notif_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `allocations`
--
ALTER TABLE `allocations`
  ADD CONSTRAINT `allocations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `allocations_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`room_id`);

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `fees`
--
ALTER TABLE `fees`
  ADD CONSTRAINT `fees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
