-- users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullname VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NOT NULL,
    coverimage VARCHAR(500),
    refreshToken TEXT,
    password VARCHAR(255) NOT NULL,
    otp VARCHAR(255),
    otp_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- watch history table
-- CREATE TABLE IF NOT EXISTS watch_history (
--   user_id INT NOT NULL,
--   video_id INT NOT NULL,
--   watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (user_id, video_id),
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
-- );

