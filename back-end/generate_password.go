package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Danh sách password cần hash
	passwords := []string{
		"password",
		"123456",
		"admin123",
		"test123",
	}

	fmt.Println("=== PASSWORD HASH GENERATOR ===")
	fmt.Println("Sử dụng bcrypt với DefaultCost")
	fmt.Println()

	for _, password := range passwords {
		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Printf("❌ Lỗi khi hash password '%s': %v\n", password, err)
			continue
		}

		// In kết quả
		fmt.Printf("Password: '%s'\n", password)
		fmt.Printf("Hash: '%s'\n", string(hashedPassword))
		fmt.Printf("Length: %d characters\n", len(string(hashedPassword)))
		fmt.Println("---")
	}

	// Test verify
	fmt.Println("=== TEST VERIFY ===")
	testPassword := "password"
	testHash := "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
	
	err := bcrypt.CompareHashAndPassword([]byte(testHash), []byte(testPassword))
	if err != nil {
		fmt.Printf("❌ Verify failed: %v\n", err)
	} else {
		fmt.Printf("✅ Verify successful for '%s'\n", testPassword)
	}
} 