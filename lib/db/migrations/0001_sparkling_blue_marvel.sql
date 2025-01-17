CREATE TABLE IF NOT EXISTS `Chat` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `createdAt` TIMESTAMP NOT NULL,
  `title` TEXT NOT NULL,
  `userId` INT NOT NULL,
  `visibility` ENUM('public', 'private') NOT NULL DEFAULT 'private',
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
);

