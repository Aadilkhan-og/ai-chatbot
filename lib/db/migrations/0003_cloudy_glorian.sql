CREATE TABLE IF NOT EXISTS  `Vote` (
  `chatId` INT NOT NULL,
  `messageId` INT NOT NULL,
  `isUpvoted` BOOLEAN NOT NULL,
  PRIMARY KEY (`chatId`, `messageId`),
  FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE CASCADE
);


